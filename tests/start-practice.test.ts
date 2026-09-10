import { beforeEach, describe, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({
  findQuestions: vi.fn(),
  findAnswers: vi.fn(),
  createAttempt: vi.fn(),
}));
vi.mock("../src/db/client", () => ({
  db: {
    question: { findMany: mock.findQuestions },
    attemptAnswer: { findMany: mock.findAnswers },
    attempt: { create: mock.createAttempt },
  },
}));
import { startPractice, StartPracticeSchema } from "../src/server/use-cases/start-practice";
import { careers, topicDbId } from "../src/content/study-plan";

beforeEach(() => {
  vi.clearAllMocks();
  mock.findAnswers.mockResolvedValue([]);
  mock.createAttempt.mockResolvedValue({ id: "attempt" });
});
describe("Inicio de práctica con carrera", () => {
  it("rechaza carrera faltante o inventada antes de consultar la base", async () => {
    expect(StartPracticeSchema.safeParse({ userId: "u", careerId: "inventada" }).success).toBe(
      false,
    );
    await expect(startPractice({ userId: "u", careerId: "" })).rejects.toThrow();
    expect(mock.findQuestions).not.toHaveBeenCalled();
  });
  it("guarda exactamente las preguntas asignadas y no selecciona campos con respuestas correctas", async () => {
    mock.findQuestions.mockResolvedValue([
      { id: "extra", topicId: "custom", text: "Extra", answers: [] },
      { id: "official", topicId: topicDbId("3.1.1.1"), text: "Oficial", answers: [] },
    ]);
    const result = await startPractice({ userId: "u", careerId: careers[0]!.id, questionCount: 1 });
    expect(result.questions.map((q) => q.id)).toEqual(["official"]);
    expect(mock.createAttempt.mock.calls[0]![0].data.config.questionIds).toEqual(["official"]);
    expect(mock.findQuestions.mock.calls[0]![0].select.answers.select).not.toHaveProperty(
      "isCorrect",
    );
  });
  it("no crea intentos vacíos", async () => {
    mock.findQuestions.mockResolvedValue([]);
    expect(await startPractice({ userId: "u", careerId: careers[0]!.id })).toEqual({
      attemptId: null,
      questions: [],
    });
    expect(mock.createAttempt).not.toHaveBeenCalled();
  });
});
