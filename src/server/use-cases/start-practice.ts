import { z } from "zod";
import { db } from "@/db/client";
import {
  careerTopicIds,
  getCareer,
  officialTopicIds,
  selectPracticeQuestions,
} from "@/content/study-plan";

export const StartPracticeSchema = z.object({
  userId: z.string().min(1),
  careerId: z.string().refine((id) => !!getCareer(id), "Selecciona una carrera del Anexo I."),
  subjectId: z.string().min(1).optional(),
  topicId: z.string().min(1).optional(),
  scope: z.enum(["career", "official", "extra", "all"]).default("career"),
  difficulty: z.enum(["BAJA", "MEDIA", "ALTA"]).optional(),
  questionCount: z.number().int().min(1).max(50).default(10),
});

export async function startPractice(input: z.input<typeof StartPracticeSchema>) {
  const data = StartPracticeSchema.parse(input);
  const career = getCareer(data.careerId)!;
  const [candidates, answered] = await Promise.all([
    db.question.findMany({
      where: {
        status: "PUBLICADO",
        deletedAt: null,
        subjectId: data.subjectId,
        difficulty: data.difficulty,
        AND: [
          data.topicId ? { topicId: data.topicId } : {},
          data.scope === "career"
            ? { topicId: { in: careerTopicIds(career) } }
            : data.scope === "official"
              ? { topicId: { in: officialTopicIds } }
              : data.scope === "extra"
                ? { topicId: { notIn: officialTopicIds } }
                : {},
        ],
      },
      select: {
        id: true,
        topicId: true,
        text: true,
        difficulty: true,
        estimatedTimeSeconds: true,
        answers: { select: { id: true, text: true, order: true } },
      },
    }),
    db.attemptAnswer.findMany({
      where: {
        attempt: { userId: data.userId, status: "ENTREGADO" },
        selectedAnswerId: { not: null },
      },
      distinct: ["questionId"],
      select: { questionId: true },
    }),
  ]);
  const selected = selectPracticeQuestions(
    shuffle(candidates),
    career,
    new Set(answered.map((a) => a.questionId)),
    data.questionCount,
  );
  if (!selected.length) return { attemptId: null, questions: [] };
  const attempt = await db.attempt.create({
    data: {
      userId: data.userId,
      type: "PRACTICA",
      config: {
        careerId: career.id,
        subjectId: data.subjectId ?? null,
        topicId: data.topicId ?? null,
        scope: data.scope,
        difficulty: data.difficulty ?? null,
        questionIds: selected.map((q) => q.id),
      },
    },
  });
  return {
    attemptId: attempt.id,
    questions: selected.map(({ topicId: _topicId, ...q }) => ({
      ...q,
      answers: shuffle(q.answers),
    })),
  };
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}
