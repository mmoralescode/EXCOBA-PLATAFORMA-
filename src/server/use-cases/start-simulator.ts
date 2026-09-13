import { z } from "zod";
import { db } from "@/db/client";
import {
  assignAnswerModes,
  selectMixedQuestions,
  usedSimulatorQuestionIds,
} from "./simulator-formats";
import {
  SIMULATOR_QUESTION_COUNT,
  SIMULATOR_TIME_LIMIT_SECONDS,
} from "@/content/simulator-settings";

export class SimulatorStartError extends Error {}

export const StartSimulatorSchema = z.object({
  userId: z.string().min(1),
  questionCount: z.number().int().min(5).max(200).default(SIMULATOR_QUESTION_COUNT),
  timeLimitSeconds: z
    .number()
    .int()
    .min(60)
    .max(4 * 60 * 60)
    .default(SIMULATOR_TIME_LIMIT_SECONDS),
  subjectIds: z.array(z.string().min(1)).optional(),
});

export async function startSimulator(input: z.infer<typeof StartSimulatorSchema>) {
  const data = StartSimulatorSchema.parse(input);

  // Serializa la asignación por alumno: dos pestañas no pueden reservar el mismo reactivo.
  return db.$transaction(
    async (tx) => {
      const user = await tx.$queryRaw<
        Array<{ id: string }>
      >`SELECT "id" FROM "User" WHERE "id" = ${data.userId} FOR UPDATE`;
      if (!user.length) throw new SimulatorStartError("Usuario no encontrado.");
      const history = await tx.attempt.findMany({
        where: { userId: data.userId, type: "SIMULADOR" },
        select: { config: true, answers: { select: { questionId: true } } },
      });
      const usedIds = usedSimulatorQuestionIds(history);

      const candidates = await tx.question.findMany({
        where: {
          id: { notIn: usedIds },
          status: "PUBLICADO",
          deletedAt: null,
          answers: { some: {} },
          subjectId: data.subjectIds ? { in: data.subjectIds } : undefined,
        },
        select: {
          id: true,
          text: true,
          difficulty: true,
          subjectId: true,
          topicId: true,
          answers: { select: { id: true, text: true } },
        },
      });

      const selected = selectMixedQuestions(shuffle(candidates), data.questionCount);
      if (selected.length < data.questionCount) {
        throw new SimulatorStartError(
          `Quedan ${candidates.length} preguntas nuevas disponibles para esta selección. Se necesitan ${data.questionCount} para otro simulador sin repetir. Hace falta ampliar el banco; puedes continuar en Práctica.`,
        );
      }

      const answerModes = assignAnswerModes(selected);
      const ordered = shuffle(selected);
      const attempt = await tx.attempt.create({
        data: {
          userId: data.userId,
          type: "SIMULADOR",
          config: {
            timeLimitSeconds: data.timeLimitSeconds,
            questionIds: ordered.map((q) => q.id),
            answerModes,
          },
        },
      });

      return {
        attemptId: attempt.id,
        startedAt: attempt.startedAt,
        timeLimitSeconds: data.timeLimitSeconds,
        questions: ordered.map((q) => ({
          ...q,
          answerMode: answerModes[q.id],
          answers: shuffle(q.answers),
        })),
      };
    },
    { timeout: 30_000, isolationLevel: "ReadCommitted" },
  );
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = temp;
  }
  return copy;
}
