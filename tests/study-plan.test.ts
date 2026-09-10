import { describe, expect, it } from "vitest";
import {
  careers,
  getCareer,
  officialSubjects,
  officialTopics,
  orderSubjects,
  topicDbId,
  priorityForTopic,
  prioritizeQuestions,
  completion,
} from "../src/content/study-plan";

describe("Ruta de estudio según Anexo I UAQ 2026-1", () => {
  it("incluye las 49 carreras, sin duplicados, con tres áreas de bachillerato válidas", () => {
    expect(careers).toHaveLength(49);
    expect(new Set(careers.map((c) => c.name)).size).toBe(49);
    const groups = new Map<string, number>();
    for (const career of careers) {
      expect(new Set(career.subjectIds).size).toBe(3);
      expect(
        career.subjectIds.every(
          (id) => id.startsWith("3.") && officialSubjects.some((s) => s.id === id),
        ),
      ).toBe(true);
      groups.set(career.subjectIds.join(","), (groups.get(career.subjectIds.join(",")) ?? 0) + 1);
    }
    expect(Object.fromEntries(groups)).toEqual({
      "3.1,3.4,3.6": 3,
      "3.3,3.4,3.6": 8,
      "3.2,3.3,3.6": 4,
      "3.2,3.3,3.5": 20,
      "3.1,3.5,3.8": 14,
    });
    expect(getCareer("invalid")).toBeNull();
  });
  it("respeta Medicina y los límites de celdas combinadas del PDF", () => {
    const areas = (name: string) => careers.find((c) => c.name === name)?.subjectIds;
    expect(areas("MEDICINA GENERAL (QUERÉTARO)")).toEqual(["3.1", "3.4", "3.6"]);
    expect(areas("TSU EN MANEJO DE ALIMENTOS Y CULTURA DEL VINO (QUERÉTARO)")).toEqual([
      "3.1",
      "3.4",
      "3.6",
    ]);
    expect(areas("BIOLOGÍA (QUERÉTARO)")).toEqual(["3.3", "3.4", "3.6"]);
    expect(areas("INGENIERO EN AGROBIOTECNOLOGÍA")).toEqual(["3.2", "3.3", "3.6"]);
    expect(areas("QUÍMICO FARMACÉUTICO BIÓLOGO (QUERÉTARO)")).toEqual(["3.2", "3.3", "3.6"]);
    expect(areas("ANIMACIÓN DIGITAL Y MEDIOS INTERACTIVOS (QUERÉTARO)")).toEqual([
      "3.2",
      "3.3",
      "3.5",
    ]);
  });
  it("no confunde cálculo, estadística ni matemáticas de otros niveles", () => {
    const medicine = careers[0]!;
    expect(
      orderSubjects(officialSubjects, medicine)
        .slice(0, 3)
        .map((s) => s.id),
    ).toEqual(["3.1", "3.4", "3.6"]);
    const topic = (subjectId: string) =>
      topicDbId(officialTopics.find((t) => t.subjectId === subjectId)!.id);
    expect(priorityForTopic(topic("3.1"), medicine)).toBe(0);
    expect(priorityForTopic(topic("3.2"), medicine)).toBe(1);
    expect(priorityForTopic(topic("1.2"), medicine)).toBe(1);
    expect(priorityForTopic("custom-matematicas", medicine)).toBe(2);
  });
  it("ordena prioridad oficial, resto oficial y extras sin perder preguntas; evita repetir dentro del nivel", () => {
    const medicine = careers[0]!;
    const items = [
      { id: "extra", topicId: "extra" },
      { id: "rest", topicId: topicDbId("1.1.1") },
      { id: "seen", topicId: topicDbId("3.1.1.1") },
      { id: "new", topicId: topicDbId("3.1.1.1") },
    ];
    expect(prioritizeQuestions(items, medicine, new Set(["seen"])).map((q) => q.id)).toEqual([
      "new",
      "seen",
      "rest",
      "extra",
    ]);
    expect(items[0]!.id).toBe("extra");
    expect(completion(0, 0)).toBe(0);
    expect(completion(10, 3)).toBe(30);
    expect(completion(10, 20)).toBe(100);
  });
});
