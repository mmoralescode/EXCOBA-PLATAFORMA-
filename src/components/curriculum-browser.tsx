"use client";

import Link from "next/link";
import { useState } from "react";
import { curriculum, questions } from "@/content/bank";

export function CurriculumBrowser() {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [availability, setAvailability] = useState("");
  const counts = new Map<string, number>();
  questions.forEach((q) => counts.set(q.topicId, (counts.get(q.topicId) ?? 0) + 1));
  const normalize = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const topics = curriculum.topics.filter(
    (t) =>
      (!subject || t.subjectId === subject) &&
      normalize(`${t.id} ${t.name}`).includes(normalize(search)) &&
      (!availability ||
        (availability === "practice"
          ? counts.has(t.id)
          : availability === "demo"
            ? t.demoIds.length > 0
            : !counts.has(t.id))),
  );

  return (
    <section className="mt-8 space-y-6" aria-label="Temario oficial 2026-2">
      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          [curriculum.topics.length, "temas oficiales"],
          [questions.length, "ejercicios nuevos"],
          [counts.size, "temas con práctica"],
        ].map(([n, label]) => (
          <div key={label} className="rounded-xl border border-ink/10 bg-white p-3">
            <strong className="block text-2xl text-pizarron">{n}</strong>
            <span className="text-sm">{label}</span>
          </div>
        ))}
      </div>
      <p className="text-sm text-ink/70">
        El demo contiene ejemplos parciales de 71 temas. Este catálogo incluye los 209 temas del
        instructivo, para todas las especialidades. Tener ejercicios no significa que un tema esté
        completamente desarrollado.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm sm:col-span-2">
          Buscar tema o código
          <input
            className="mt-1 w-full rounded-md border border-ink/20 p-3"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Fracciones, química, 3.1…"
            type="search"
          />
        </label>
        <label className="text-sm">
          Materia
          <select
            className="mt-1 w-full rounded-md border border-ink/20 p-3"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            <option value="">Todas las materias</option>
            {curriculum.subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Disponibilidad
          <select
            className="mt-1 w-full rounded-md border border-ink/20 p-3"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
          >
            <option value="">Todos los temas</option>
            <option value="practice">Con ejercicios nuevos</option>
            <option value="demo">Con ejemplos en el demo</option>
            <option value="pending">Sin ejercicios nuevos todavía</option>
          </select>
        </label>
      </div>
      <p role="status" className="text-sm text-ink/70">
        {topics.length} temas encontrados
      </p>
      {curriculum.subjects.map((s) => {
        const items = topics.filter((t) => t.subjectId === s.id);
        if (!items.length) return null;
        return (
          <section key={s.id}>
            <h2 className="mb-3 font-display text-xl text-pizarron">{s.name}</h2>
            <div className="space-y-3">
              {items.map((t) => (
                <details key={t.id} className="rounded-xl border border-ink/10 bg-white p-4">
                  <summary className="cursor-pointer font-medium">
                    {t.id} · {t.name.split(". ")[0]}{" "}
                    <span className="ml-2 text-sm font-normal text-ink/60">
                       {counts.get(t.id) ? `${counts.get(t.id)} ${counts.get(t.id) === 1 ? "ejercicio" : "ejercicios"}` : "Práctica pendiente"}
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed">{t.name}</p>
                  <p className="mt-2 text-xs text-ink/60">
                    Instructivo 2026-2, página impresa {t.page}.{" "}
                    {t.demoIds.length
                      ? `Referencia del demo: ${t.demoIds.join(", ")} (muestra parcial).`
                      : "Sin ejemplo directo identificado en el demo."}
                  </p>
                  {counts.has(t.id) && (
                    <Link
                      className="mt-3 inline-block font-medium text-pizarron underline"
                      href={`/banco?tema=${encodeURIComponent(t.id)}`}
                    >
                      Practicar este tema
                    </Link>
                  )}
                </details>
              ))}
            </div>
          </section>
        );
      })}
    </section>
  );
}
