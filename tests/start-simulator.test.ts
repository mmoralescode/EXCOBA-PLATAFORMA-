import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  findQuestions: vi.fn(),
  createAttempt: vi.fn(),
  findAttempt: vi.fn(),
  findQuestion: vi.fn(),
  savedAnswers: vi.fn(),
  upsertAnswer: vi.fn(),
}));
vi.mock("../src/db/client", () => ({
  db: {
    question: { findMany: mocks.findQuestions, findUnique: mocks.findQuestion },
    attempt: { create: mocks.createAttempt, findUnique: mocks.findAttempt },
    attemptAnswer: { findMany: mocks.savedAnswers, upsert: mocks.upsertAnswer },
  },
}));
import { startSimulator, StartSimulatorSchema } from "../src/server/use-cases/start-simulator";
import { saveSimulatorAnswer, getSimulatorState } from "../src/server/use-cases/simulator-state";
beforeEach(() => {
  vi.resetAllMocks();
  mocks.createAttempt.mockResolvedValue({ id: "attempt-60", startedAt: new Date() });
  mocks.findAttempt.mockResolvedValue({
    id: "attempt-60",
    userId: "student",
    type: "SIMULADOR",
    status: "EN_CURSO",
    startedAt: new Date(),
    config: { timeLimitSeconds: 3600, questionIds: ["q1", "q2"] },
  });
});
describe("Sesiones ampliadas del simulador", () => {
  it("asigna 60 preguntas distintas, persiste el conjunto y no consulta claves correctas", async () => {
    mocks.findQuestions.mockResolvedValue(
      Array.from({ length: 158 }, (_, n) => ({
        id: `q${n}`,
        text: "Reactivo",
        subjectId: "subject",
        answers: [{ id: `a${n}`, text: "Opción" }],
      })),
    );
    const result = await startSimulator(StartSimulatorSchema.parse({ userId: "student" }));
    expect(result.questions).toHaveLength(60);
    expect(new Set(result.questions.map((q) => q.id)).size).toBe(60);
    expect(result.timeLimitSeconds).toBe(3600);
    expect(mocks.createAttempt.mock.calls[0]![0].data.config.questionIds).toEqual(
      result.questions.map((q) => q.id),
    );
    expect(mocks.findQuestions.mock.calls[0]![0].select.answers.select).toEqual({
      id: true,
      text: true,
    });
  });
  it("no inicia si no hay suficientes preguntas", async () => {
    mocks.findQuestions.mockResolvedValue([]);
    await expect(startSimulator(StartSimulatorSchema.parse({ userId: "student" }))).rejects.toThrow(
      "No hay suficientes",
    );
    expect(mocks.createAttempt).not.toHaveBeenCalled();
  });
  it("guarda y elimina la respuesta arrastrada usando los mismos IDs", async () => {
    mocks.findQuestion.mockResolvedValue({ answers: [{ id: "a1" }] });
    for (const selectedAnswerId of ["a1", null]) {
      await saveSimulatorAnswer({
        attemptId: "attempt-60",
        userId: "student",
        questionId: "q1",
        selectedAnswerId,
        flaggedForReview: false,
      });
      expect(mocks.upsertAnswer).toHaveBeenLastCalledWith(
        expect.objectContaining({ update: expect.objectContaining({ selectedAnswerId }) }),
      );
    }
  });
  it("rechaza opciones ajenas a la pregunta y cuentas ajenas al intento", async () => {
    mocks.findQuestion.mockResolvedValue({ answers: [{ id: "a1" }] });
    await expect(
      saveSimulatorAnswer({
        attemptId: "attempt-60",
        userId: "student",
        questionId: "q1",
        selectedAnswerId: "a2",
        flaggedForReview: false,
      }),
    ).rejects.toThrow("no es válida");
    await expect(getSimulatorState("attempt-60", "other-user")).rejects.toThrow("no encontrado");
    expect(mocks.upsertAnswer).not.toHaveBeenCalled();
  });
  it("recupera elecciones y orden original, sin revelar claves", async () => {
    const saved = [{ questionId: "q1", selectedAnswerId: "a1", flaggedForReview: false }];
    mocks.savedAnswers.mockResolvedValue(saved);
    mocks.findQuestions.mockResolvedValue([
      { id: "q2", answers: [] },
      { id: "q1", answers: [{ id: "a1", text: "Opción" }] },
    ]);
    const result = await getSimulatorState("attempt-60", "student");
    expect(result.savedAnswers).toEqual(saved);
    expect(result.questions.map((q) => q.id)).toEqual(["q1", "q2"]);
    expect(mocks.findQuestions.mock.calls[0]![0].select.answers.select).toEqual({
      id: true,
      text: true,
    });
  });
});
