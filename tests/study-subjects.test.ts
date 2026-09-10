import { describe, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({ subjects: vi.fn(), answers: vi.fn() }));
vi.mock("../src/db/client", () => ({
  db: {
    subject: { findMany: mock.subjects },
    attemptAnswer: { findMany: mock.answers },
  },
}));
import { getStudySubjects } from "../src/server/use-cases/study-subjects";
import { topicDbId, subjectDbId } from "../src/content/study-plan";

describe("Progreso por asignatura", () => {
  it("cuenta temas únicos, conserva lecciones y separa extras sin cambiar IDs", async () => {
    mock.subjects.mockResolvedValue([
      {
        id: subjectDbId("1.1"),
        name: "Español",
        topics: [
          {
            id: topicDbId("1.1.1"),
            name: "Tema oficial",
            _count: { questions: 2 },
            lessons: [{ id: "lesson", title: "Lección", content: "Contenido" }],
          },
          { id: "custom", name: "Tema extra", _count: { questions: 1 }, lessons: [] },
        ],
      },
    ]);
    mock.answers.mockResolvedValue([
      { question: { topicId: topicDbId("1.1.1") } },
      { question: { topicId: topicDbId("1.1.1") } },
      { question: { topicId: "custom" } },
    ]);
    const result = await getStudySubjects("student-a");
    const spanish = result.find((s) => s.officialId === "1.1")!;
    expect(spanish.answered).toBe(1);
    expect(spanish.percent).toBe(10);
    expect(spanish.topics).toHaveLength(10);
    expect(spanish.topics[0]!.lessons[0]!.id).toBe("lesson");
    expect(result.find((s) => s.scope === "extra")!.answered).toBe(1);
    expect(result.find((s) => s.officialId === "3.8")!.percent).toBe(0);
    expect(mock.answers.mock.calls[0]![0].where).toEqual({
      attempt: { userId: "student-a", status: "ENTREGADO" },
      selectedAnswerId: { not: null },
    });
  });
});
