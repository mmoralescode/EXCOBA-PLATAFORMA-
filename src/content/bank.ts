import curriculum from "./curriculum.json";
import questions from "./questions.json";

export { curriculum, questions };
export type BankQuestion = (typeof questions)[number];

export function filterQuestions(subjectId = "", topicId = "") {
  return questions.filter(
    (q) =>
      (!subjectId || q.topicId.startsWith(`${subjectId}.`)) && (!topicId || q.topicId === topicId),
  );
}

/** Formative practice only. These results are not official attempt scores. */
export function gradePractice(items: BankQuestion[], selected: Record<string, number>) {
  const correct = items.filter((q) => selected[q.id] === q.correctIndex).length;
  return {
    correct,
    total: items.length,
    score: items.length ? Math.round((correct / items.length) * 100) : 0,
  };
}

export function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}
