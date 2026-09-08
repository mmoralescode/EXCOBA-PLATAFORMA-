"use client";

import { useState } from "react";
import Link from "next/link";
import { BankQuestion, curriculum, filterQuestions, gradePractice, shuffled } from "@/content/bank";

export function QuestionBank({ initialTopic = "" }: { initialTopic?: string }) {
  const initial = curriculum.topics.find((t) => t.id === initialTopic);
  const [subject, setSubject] = useState(initial?.subjectId ?? "");
  const [topic, setTopic] = useState(initial?.id ?? "");
  const [size, setSize] = useState(10);
  const [items, setItems] = useState<BankQuestion[]>([]);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState(false);
  const available = filterQuestions(subject, topic);
  const result = gradePractice(items, selected);
  const active = items.length > 0;
  const topics = curriculum.topics.filter(
    (t) => (!subject || t.subjectId === subject) && filterQuestions("", t.id).length,
  );

  function start(source = available) {
    setItems(shuffled(source).slice(0, size));
    setSelected({});
    setFinished(false);
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/estudio" className="text-sm text-pizarron underline">
        Volver al temario
      </Link>
      <h1 className="mt-4 font-display text-3xl text-pizarron">Banco de práctica 2026-2</h1>
      <p className="mt-3 text-sm text-ink/70">
        Ejercicios originales sobre habilidades presentes en el demo, adaptados a opción múltiple.
        Incluyen explicación. Esta práctica es de autoestudio: el resultado permanece en esta sesión
        de la página y no se guarda en tu perfil.
      </p>
      {!active && (
        <div className="mt-6 space-y-4 rounded-xl border border-ink/10 bg-white p-5">
          <label className="block text-sm">
            Materia
            <select
              className="mt-1 w-full rounded-md border p-3"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setTopic("");
              }}
            >
              <option value="">Todas las materias</option>
              {curriculum.subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Tema
            <select
              className="mt-1 w-full rounded-md border p-3"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            >
              <option value="">Todos los temas con ejercicios</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id} · {t.name.split(". ")[0]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Preguntas por sesión
            <select
              className="ml-3 rounded-md border p-2"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
          <p role="status" className="text-sm">
            {available.length} disponibles; practicarás {Math.min(size, available.length)}.
          </p>
          <button
            type="button"
            disabled={!available.length}
            onClick={() => start()}
            className="rounded-md bg-pizarron px-5 py-3 text-white disabled:opacity-50"
          >
            Empezar práctica
          </button>
        </div>
      )}
      {active && (
        <>
          <p className="my-6 text-sm" role="status">
            {Object.keys(selected).length} de {items.length} respondidas
            {finished ? ` · Resultado: ${result.correct}/${result.total} (${result.score}%)` : ""}
          </p>
          <div className="space-y-6">
            {items.map((q, index) => (
              <fieldset key={q.id} className="rounded-xl border border-ink/15 bg-white p-5">
                <legend className="px-2 text-sm text-ink/60">
                  Pregunta {index + 1} · Tema {q.topicId}
                </legend>
                <p className="font-medium leading-relaxed">{q.text}</p>
                <div className="mt-4 space-y-2">
                  {q.options.map((option, i) => (
                    <label
                      key={i}
                      className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 ${selected[q.id] === i ? "border-pizarron bg-pizarron/5" : "border-ink/10"}`}
                    >
                      <input
                        className="mt-1"
                        type="radio"
                        name={q.id}
                        checked={selected[q.id] === i}
                        disabled={finished}
                        onChange={() => setSelected((prev) => ({ ...prev, [q.id]: i }))}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
                {finished && (
                  <div className="mt-4 border-t border-ink/10 pt-4 text-sm leading-relaxed">
                    <p className="font-semibold">
                      {selected[q.id] === q.correctIndex
                        ? "Correcta"
                        : selected[q.id] === undefined
                          ? "Sin responder"
                          : "Incorrecta"}{" "}
                      · Respuesta: {q.options[q.correctIndex]}
                    </p>
                    <p className="mt-2">{q.explanation}</p>
                    <p className="mt-2 text-xs text-ink/60">
                      Ejercicio original · Referencia de habilidad: {q.demoId}
                    </p>
                  </div>
                )}
              </fieldset>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {!finished ? (
              <button
                type="button"
                onClick={() => setFinished(true)}
                className="rounded-md bg-pizarron px-5 py-3 text-white"
              >
                Revisar respuestas ({items.length - Object.keys(selected).length} sin responder)
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setItems([]);
                    setSelected({});
                    setFinished(false);
                  }}
                  className="rounded-md bg-pizarron px-5 py-3 text-white"
                >
                  Elegir otra práctica
                </button>
                {result.correct < result.total && (
                  <button
                    type="button"
                    onClick={() => start(items.filter((q) => selected[q.id] !== q.correctIndex))}
                    className="rounded-md border border-pizarron px-5 py-3 text-pizarron"
                  >
                    Repetir errores y omitidas
                  </button>
                )}
              </>
            )}
          </div>
        </>
      )}
    </main>
  );
}
