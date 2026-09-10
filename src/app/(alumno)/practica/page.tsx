"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CareerSelector, useCareer } from "@/components/career-selector";
import type { StudySubject } from "@/content/study-types";

type Subject = Omit<StudySubject, "topics">;
type Question = { id: string; text: string; answers: { id: string; text: string }[] };
type Result = { score: number; correctCount: number; totalCount: number };

export default function PracticaPage() {
  const { career, choose, ready } = useCareer();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [mode, setMode] = useState<"area" | "all" | null>(null);
  const [subjectKey, setSubjectKey] = useState("");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/subjects", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok)
          throw new Error(
            "No se pudieron cargar las áreas. Recarga la página o inicia sesión de nuevo.",
          );
        return response.json();
      })
      .then((data: { subjects: Subject[] }) => {
        setSubjects(data.subjects);
        const params = new URLSearchParams(window.location.search);
        const subject = data.subjects.find(
          (s) => s.id === params.get("subject") && s.scope === (params.get("scope") ?? "official"),
        );
        if (subject) {
          setSubjectKey(subject.key);
          setMode("area");
        }
      })
      .catch((err: Error) => {
        if (err.name !== "AbortError") setError(err.message);
      })
      .finally(() => setLoadingSubjects(false));
    return () => controller.abort();
  }, []);

  async function start() {
    if (!career) return;
    const subject = subjects.find((s) => s.key === subjectKey);
    if (mode === "area" && !subject) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/practice/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          careerId: career.id,
          questionCount: 10,
          subjectId: mode === "area" ? subject?.id : undefined,
          scope: mode === "area" ? subject?.scope : "all",
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "No se pudo iniciar la práctica.");
      if (!data.questions.length)
        throw new Error("Todavía no hay preguntas publicadas para esta selección.");
      setAttemptId(data.attemptId);
      setQuestions(data.questions);
      setSelected({});
      setIndex(0);
      setResult(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  async function submit() {
    if (!attemptId) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/practice/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          answers: questions.map((q) => ({
            questionId: q.id,
            selectedAnswerId: selected[q.id] ?? null,
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "No se pudo entregar la práctica.");
      setResult(data);
      setAttemptId(null);
      setQuestions([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }
  const q = questions[index];
  const sections = [
    {
      name: "Prioridad para tu carrera",
      items: subjects.filter(
        (s) => s.scope === "official" && career?.subjectIds.includes(s.officialId ?? ""),
      ),
    },
    {
      name: "Resto de temas EXCOBA",
      items: subjects.filter(
        (s) => s.scope === "official" && !career?.subjectIds.includes(s.officialId ?? ""),
      ),
    },
    { name: "Contenido complementario", items: subjects.filter((s) => s.scope === "extra") },
  ];
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-display text-3xl text-pizarron">Práctica</h1>
      {!ready && (
        <p role="status" className="mt-6 text-ink/60">
          Cargando tu selección…
        </p>
      )}
      {ready && !attemptId && !result && (
        <div className="mt-6 space-y-6">
          {!career ? (
            <CareerSelector value="" onChange={choose} />
          ) : (
            <>
              <details className="text-sm text-ink/70">
                <summary className="cursor-pointer">{career.name} · Cambiar carrera</summary>
                <div className="mt-4">
                  <CareerSelector
                    value={career.id}
                    onChange={(id) => {
                      choose(id);
                      setMode(null);
                      setSubjectKey("");
                    }}
                  />
                </div>
              </details>
              <h2 className="font-display text-xl text-pizarron">¿Qué área quieres comenzar?</h2>
              <div
                className="grid gap-3 sm:grid-cols-2"
                role="group"
                aria-label="Modalidad de práctica"
              >
                <button
                  type="button"
                  aria-pressed={mode === "area"}
                  onClick={() => setMode("area")}
                  className={`rounded-xl border p-4 text-left ${mode === "area" ? "border-pizarron bg-pizarron text-white" : "border-ink/15 bg-white text-pizarron"}`}
                >
                  Elegir un área
                </button>
                <button
                  type="button"
                  aria-pressed={mode === "all"}
                  onClick={() => setMode("all")}
                  className={`rounded-xl border p-4 text-left ${mode === "all" ? "border-pizarron bg-pizarron text-white" : "border-ink/15 bg-white text-pizarron"}`}
                >
                  Practicar todos los temas
                </button>
              </div>
              {mode === "area" && (
                <label className="block text-sm text-ink/70">
                  Asignatura
                  <select
                    value={subjectKey}
                    onChange={(event) => setSubjectKey(event.target.value)}
                    disabled={loadingSubjects}
                    className="mt-2 w-full rounded-lg border border-ink/20 bg-white p-3"
                  >
                    <option value="">
                      {loadingSubjects ? "Cargando áreas…" : "Selecciona un área"}
                    </option>
                    {sections
                      .filter((s) => s.items.length > 0)
                      .map((section) => (
                        <optgroup key={section.name} label={section.name}>
                          {section.items.map((subject) => (
                            <option
                              key={subject.key}
                              value={subject.key}
                              disabled={!subject.questionCount}
                            >
                              {subject.name}
                              {!subject.questionCount ? " · Práctica pendiente" : ""}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                  </select>
                </label>
              )}
              {mode && (
                <div className="flex items-center justify-between gap-4 rounded-xl bg-white p-4">
                  <p className="text-sm leading-6 text-ink/70">
                    Hasta 10 preguntas por sesión.
                    {mode === "all" &&
                      " Primero tus áreas EXCOBA, luego el resto del temario y al final los extras."}
                  </p>
                  <button
                    type="button"
                    onClick={start}
                    disabled={
                      loading ||
                      loadingSubjects ||
                      (mode === "area" &&
                        !subjects.some((s) => s.key === subjectKey && s.questionCount > 0))
                    }
                    aria-label="Iniciar práctica"
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-pizarron text-white disabled:opacity-40"
                  >
                    <span aria-hidden="true">{loading ? "…" : "▶"}</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
      {error && (
        <p role="alert" className="mt-5 text-sm text-alerta">
          {error}
        </p>
      )}
      {attemptId && q && (
        <div className="mt-6 space-y-6">
          <p className="text-sm text-ink/60">
            Pregunta {index + 1} de {questions.length} · {Object.keys(selected).length} respondidas
          </p>
          <fieldset className="rounded-xl border border-ink/10 bg-white p-5">
            <legend className="sr-only">Pregunta {index + 1}</legend>
            <p className="leading-7 text-ink">{q.text}</p>
            <div className="mt-5 space-y-3">
              {q.answers.map((answer) => (
                <label
                  key={answer.id}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-ink/10 p-3 text-sm leading-6"
                >
                  <input
                    type="radio"
                    name={q.id}
                    checked={selected[q.id] === answer.id}
                    onChange={() => setSelected((previous) => ({ ...previous, [q.id]: answer.id }))}
                    className="mt-1"
                    disabled={loading}
                  />
                  {answer.text}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setIndex(index - 1)}
              disabled={index === 0 || loading}
              className="rounded-lg border border-ink/20 px-4 py-3 text-sm disabled:opacity-40"
            >
              Anterior
            </button>
            {index < questions.length - 1 ? (
              <button
                onClick={() => setIndex(index + 1)}
                disabled={loading}
                className="rounded-lg bg-pizarron px-4 py-3 text-sm text-white"
              >
                {selected[q.id] ? "Siguiente" : "Omitir y continuar"}
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={loading}
                className="rounded-lg bg-pizarron px-4 py-3 text-sm text-white disabled:opacity-40"
              >
                {loading ? "Guardando…" : "Entregar práctica"}
              </button>
            )}
          </div>
          {index === questions.length - 1 && (
            <p className="text-xs text-ink/60">
              Las preguntas omitidas cuentan como incorrectas. Puedes volver con “Anterior” para
              revisarlas.
            </p>
          )}
        </div>
      )}
      {result && (
        <div className="mt-6 space-y-4 rounded-xl border border-ink/10 bg-white p-6">
          <p className="font-display text-3xl text-pizarron">{Math.round(result.score)}%</p>
          <p className="text-ink/70">
            {result.correctCount} de {result.totalCount} respuestas correctas.
          </p>
          <p className="text-sm text-ink/60">Tu avance se guardó en tu cuenta.</p>
          <div className="flex items-center justify-between gap-4">
            <Link href="/estudio" className="text-sm text-pizarron underline">
              Ver progreso
            </Link>
            <button
              aria-label="Preparar otra práctica"
              onClick={() => {
                setResult(null);
                setMode(null);
                setError("");
              }}
              className="grid h-11 w-11 place-items-center rounded-full bg-pizarron text-white"
            >
              <span aria-hidden="true">▶</span>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
