import catalog from "./careers.json";
import curriculum from "./curriculum.json";

export const careers = catalog.careers;
export const officialSubjects = curriculum.subjects;
export const officialTopics = curriculum.topics;
export const CAREER_COOKIE = "excoba_career_2026_1";
export type Career = (typeof careers)[number];
export type ContentScope = "official" | "extra";
export const CONTENT_PREFIX = "uaq-2026-2"; // Preserve existing database IDs and history.

export function getCareer(id: string | null | undefined) {
  return careers.find((career) => career.id === id) ?? null;
}
export const subjectDbId = (id: string) => `${CONTENT_PREFIX}-subject-${id}`;
export const topicDbId = (id: string) => `${CONTENT_PREFIX}-topic-${id}`;
export const officialTopicIds = officialTopics.map((topic) => topicDbId(topic.id));
const topicMap = new Map(officialTopics.map((topic) => [topicDbId(topic.id), topic]));
export function officialTopic(topicId: string) {
  return topicMap.get(topicId);
}
export function priorityForTopic(topicId: string, career: Career | null) {
  const topic = officialTopic(topicId);
  return !topic ? 2 : career?.subjectIds.includes(topic.subjectId) ? 0 : 1;
}
export function orderSubjects<T extends { id: string }>(items: T[], career: Career | null) {
  return [...items].sort(
    (a, b) =>
      Number(!career?.subjectIds.includes(a.id)) - Number(!career?.subjectIds.includes(b.id)),
  );
}
export function topicTitle(name: string) {
  return name.split(". ")[0]!.replace(/\.$/, "");
}
export function completion(total: number, answered: number) {
  return total > 0 ? Math.min(100, Math.round((answered / total) * 100)) : 0;
}

/** Shuffle before passing here. Stable tiers preserve randomness within each tier;
 * unseen questions come first within a tier so repeated sessions cover more topics. */
export function prioritizeQuestions<T extends { id: string; topicId: string }>(
  items: T[],
  career: Career,
  answeredIds: ReadonlySet<string> = new Set(),
) {
  return [...items].sort(
    (a, b) =>
      priorityForTopic(a.topicId, career) - priorityForTopic(b.topicId, career) ||
      Number(answeredIds.has(a.id)) - Number(answeredIds.has(b.id)),
  );
}
