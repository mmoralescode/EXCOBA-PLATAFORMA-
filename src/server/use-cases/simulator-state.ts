import { z } from "zod";
import { db } from "@/db/client";
import { getRemainingSeconds, parseSimulatorConfig } from "@/server/use-cases/simulator-rules";

export const SaveSimulatorAnswerSchema = z.object({
  attemptId: z.string().min(1),
  userId: z.string().min(1),
  questionId: z.string().min(1),
  selectedAnswerId: z.string().min(1).nullable(),
  flaggedForReview: z.boolean().default(false),
});

export class SimulatorStateError extends Error {}

/**
 * Guarda (upsert) la respuesta de UNA pregunta durante el simulador, sin
 * calificar todavía (la calificación ocurre sólo en `submitAttempt`, al
 * entregar). Esto permite el autosave y la recuperación ante desconexión:
 * al reconectar, el cliente vuelve a pedir el estado del intento y recibe
 * exactamente lo que ya había guardado.
 */
export async function saveSimulatorAnswer(input: z.infer<typeof SaveSimulatorAnswerSchema>) {
  const data = SaveSimulatorAnswerSchema.parse(input);

  const attempt = await getActiveSimulatorAttempt(data.attemptId, data.userId);
  const config = parseSimulatorConfig(attempt.config);
  if (!config || !config.questionIds.includes(data.questionId)) {
    throw new SimulatorStateError("La pregunta no pertenece a este simulador.");
  }

  const question = await db.question.findUnique({
    where: { id: data.questionId },
    select: { answers: { select: { id: true } } },
  });
  if (
    !question ||
    (data.selectedAnswerId && !question.answers.some((a) => a.id === data.selectedAnswerId))
  ) {
    throw new SimulatorStateError("La respuesta seleccionada no es válida.");
  }

  await db.attemptAnswer.upsert({
    where: { attemptId_questionId: { attemptId: data.attemptId, questionId: data.questionId } },
    create: {
      attemptId: data.attemptId,
      questionId: data.questionId,
      selectedAnswerId: data.selectedAnswerId,
      flaggedForReview: data.flaggedForReview,
      answeredAt: new Date(),
    },
    update: {
      selectedAnswerId: data.selectedAnswerId,
      flaggedForReview: data.flaggedForReview,
      answeredAt: new Date(),
    },
  });

  return { ok: true, remainingSeconds: getRemainingSecondsForAttempt(attempt) };
}

/** Recupera el estado completo del intento (para reconexión tras desconexión). */
export async function getSimulatorState(attemptId: string, userId: string) {
  const attempt = await getActiveSimulatorAttempt(attemptId, userId);
  const config = parseSimulatorConfig(attempt.config);
  if (!config) throw new SimulatorStateError("La configuración del simulador no es válida.");

  const savedAnswers = await db.attemptAnswer.findMany({
    where: { attemptId },
    select: { questionId: true, selectedAnswerId: true, flaggedForReview: true },
  });
  const questions = await db.question.findMany({
    where: { id: { in: config.questionIds } },
    select: {
      id: true,
      text: true,
      subjectId: true,
      answers: { select: { id: true, text: true } },
    },
  });
  const questionsById = new Map(questions.map((question) => [question.id, question]));

  return {
    attemptId: attempt.id,
    status: attempt.status,
    remainingSeconds: getRemainingSeconds(attempt.startedAt, config),
    questions: config.questionIds.flatMap((questionId) => {
      const question = questionsById.get(questionId);
      return question ? [question] : [];
    }),
    savedAnswers,
  };
}

export async function getLatestSimulatorState(userId: string) {
  const attempt = await db.attempt.findFirst({
    where: { userId, type: "SIMULADOR", status: "EN_CURSO" },
    orderBy: { startedAt: "desc" },
  });
  return attempt ? getSimulatorState(attempt.id, userId) : null;
}

async function getActiveSimulatorAttempt(attemptId: string, userId: string) {
  const attempt = await db.attempt.findUnique({ where: { id: attemptId } });
  if (!attempt || attempt.userId !== userId || attempt.type !== "SIMULADOR") {
    throw new SimulatorStateError("Simulador no encontrado.");
  }

  // Auto-expiración: si el tiempo ya se agotó pero el estado sigue
  // EN_CURSO (el alumno nunca hizo el "submit" final), se marca EXPIRADO
  // en cuanto el servidor detecta la condición, en lugar de depender de un
  // job en segundo plano.
  if (attempt.status === "EN_CURSO" && getRemainingSecondsForAttempt(attempt) <= 0) {
    await db.attempt.update({
      where: { id: attempt.id },
      data: { status: "EXPIRADO", finishedAt: new Date() },
    });
    throw new SimulatorStateError("El tiempo del simulador se agotó.");
  }

  if (attempt.status !== "EN_CURSO") {
    throw new SimulatorStateError("Este simulador ya fue entregado o expiró.");
  }
  return attempt;
}

/**
 * El tiempo restante SIEMPRE se calcula en el servidor contra
 * `startedAt` + `timeLimitSeconds` de la configuración guardada al iniciar
 * el intento — nunca se confía en un reloj del cliente (ver Módulo 1,
 * sección 14).
 */
function getRemainingSecondsForAttempt(attempt: { startedAt: Date; config: unknown }): number {
  const config = parseSimulatorConfig(attempt.config);
  return config ? getRemainingSeconds(attempt.startedAt, config) : 0;
}
