"use client";

import { useState } from "react";
import { useCareer } from "./career-selector";
import { officialSubjects, officialTopics, orderSubjects, topicTitle } from "@/content/study-plan";

export function CurriculumBrowser() {
  const { career } = useCareer();
  const [search, setSearch] = useState("");
  const normalize = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const filtered = officialTopics.filter((topic) =>
    normalize(topic.id + " " + topic.name).includes(normalize(search)),
  );
  const sections = [
    {
      title: "Primero para tu carrera",
      subjects: career
        ? orderSubjects(officialSubjects, career).filter((s) => career.subjectIds.includes(s.id))
        : [],
    },
    {
      title: career ? "Resto del temario oficial" : "Todas las asignaturas",
      subjects: officialSubjects.filter((s) => !career?.subjectIds.includes(s.id)),
    },
  ];
  return (
    <section className="mt-8 space-y-6" aria-label="Todos los temas del instructivo oficial EXCOBA">
      <label className="block text-sm text-ink/70">
        Buscar en el instructivo
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Por ejemplo: fracciones, herencia o 3.1"
          className="mt-2 w-full rounded-lg border border-ink/20 bg-white p-3"
        />
      </label>
      {search && (
        <p role="status" className="text-sm text-ink/60">
          {filtered.length} temas encontrados
        </p>
      )}
      {sections.map((section) => {
        const subjects = section.subjects.filter((subject) =>
          filtered.some((t) => t.subjectId === subject.id),
        );
        return subjects.length ? (
          <section key={section.title} className="space-y-3">
            <h2 className="font-display text-xl text-pizarron">{section.title}</h2>
            {subjects.map((subject) => (
              <details
                key={subject.id}
                open={search ? true : undefined}
                className="rounded-xl border border-ink/10 bg-white p-4"
              >
                <summary className="cursor-pointer font-medium text-pizarron">
                  {subject.name}
                  <span className="ml-2 text-xs font-normal text-ink/50">
                    {filtered.filter((t) => t.subjectId === subject.id).length} temas
                  </span>
                </summary>
                <ul className="mt-4 space-y-2 text-sm leading-6 text-ink/80">
                  {filtered
                    .filter((topic) => topic.subjectId === subject.id)
                    .map((topic) => (
                      <li key={topic.id}>
                        <span className="mr-2 text-xs text-ink/50">{topic.id}</span>
                        {topicTitle(topic.name)}
                      </li>
                    ))}
                </ul>
              </details>
            ))}
          </section>
        ) : null;
      })}
    </section>
  );
}
