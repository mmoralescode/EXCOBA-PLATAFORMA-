"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { SimulatorQuestionAnswer } from "@/components/simulator-question-answer";
import { SimulatorFormulaSheet } from "@/components/simulator-formula-sheet";
import {
  SIMULATOR_QUESTION_COUNT,
  SIMULATOR_TIME_LIMIT_SECONDS,
} from "@/content/simulator-settings";

interface Answer {
  id: string;
  text: string;
}

interface Question {
  answerMode?: "MULTIPLE_CHOICE" | "DRAG_DROP";
  id: string;
  text: string;
  subjectId: string;
  answers: Answer[];
}

interface Result {
  score: number;
  correctCount: number;
  totalCount: number;
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function SimuladorPage() {
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [recovering, setRecovering] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const attemptIdRef = useRef<string | null>(null);
  const questionsRef = useRef<Question[]>([]);
  const selectedRef = useRef<Record<string, string>>({});
  const submittingRef = useRef(false);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  attemptIdRef.current = attemptId;
  questionsRef.current = questions;
  selectedRef.current = selected;

  const submitSimulator = useCallback(async () => {
    if (!attemptIdRef.current || submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    try {
      await saveQueue.current;
      const response = await fetch("/api/simulator/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId: attemptIdRef.current,
          answers: questionsRef.current.map((q) => ({
            questionId: q.id,
            selectedAnswerId: selectedRef.current[q.id] ?? null,
          })),
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setResult(data);
        setQuestions([]);
        setAttemptId(null);
        setRemainingSeconds(null);
      } else {
        setError(data.error ?? "No se pudo entregar el simulador.");
        if (response.status === 400 && data.error?.includes("tiempo")) {
          setQuestions([]);
          setAttemptId(null);
          setRemainingSeconds(null);
        }
      }
    } catch {
      setError("No se pudo conectar con el servidor al entregar.");
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function recoverSimulator() {
      try {
        const response = await fetch("/api/simulator/answer");
        const data = await response.json();
        if (!cancelled && response.ok && data.attemptId) {
          setAttemptId(data.attemptId);
          setQuestions(data.questions ?? []);
          setRemainingSeconds(data.remainingSeconds);
          setSelected(
            Object.fromEntries(
              (data.savedAnswers ?? [])
                .filter((answer: { selectedAnswerId: string | null }) => answer.selectedAnswerId)
                .map((answer: { questionId: string; selectedAnswerId: string }) => [
                  answer.questionId,
                  answer.selectedAnswerId,
                ]),
            ),
          );
        }
      } catch {
        if (!cancelled) setError("No se pudo recuperar el simulador activo.");
      } finally {
        if (!cancelled) setRecovering(false);
      }
    }
    recoverSimulator();
    return () => {
      cancelled = true;
    };
  }, []);

  // Cronómetro visual: cuenta hacia abajo localmente cada segundo, pero el
  // valor real siempre viene del servidor (ver efecto de sincronización
  // abajo) — el navegador nunca decide cuándo se acaba el tiempo.
  useEffect(() => {
    if (remainingSeconds === null || !attemptId) return;
    if (remainingSeconds <= 0) {
      submitSimulator();
      return;
    }
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => (prev !== null ? Math.max(0, prev - 1) : prev));
    }, 1000);
    return () => clearInterval(interval);
  }, [remainingSeconds, attemptId, submitSimulator]);

  // Sincroniza el tiempo restante real contra el servidor cada 20s, y al
  // recuperar el intento tras una desconexión.
  useEffect(() => {
    if (!attemptId) return;
    const sync = async () => {
      try {
        const response = await fetch(`/api/simulator/answer?attemptId=${attemptId}`);
        const data = await response.json();
        if (response.ok) {
          setRemainingSeconds(data.remainingSeconds);
        }
      } catch {
        // Silencioso: si falla la sincronización puntual, el cronómetro
        // local sigue corriendo hasta el próximo intento.
      }
    };
    const interval = setInterval(sync, 20_000);
    return () => clearInterval(interval);
  }, [attemptId]);

  async function startSimulator() {
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/simulator/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionCount: SIMULATOR_QUESTION_COUNT,
          timeLimitSeconds: SIMULATOR_TIME_LIMIT_SECONDS,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "No se pudo iniciar el simulador.");
        return;
      }
      if (data.questions.length === 0) {
        setError("Todavía no hay preguntas publicadas para el simulador.");
        return;
      }
      setAttemptId(data.attemptId);
      setQuestions(data.questions);
      setRemainingSeconds(data.timeLimitSeconds);
      setSelected({});
      setCurrentIndex(0);
      submittingRef.current = false;
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  function selectAnswer(questionId: string, answerId: string | null) {
    if (!attemptId || loading || remainingSeconds === 0) return;
    const next = { ...selectedRef.current };
    if (answerId) next[questionId] = answerId;
    else delete next[questionId];
    selectedRef.current = next;
    setSelected(next);
    setError(null);
    // Autosave: se guarda de inmediato en el servidor para poder recuperar
    // el intento si hay una desconexión (ver Módulo 8).
    // Serializar evita que una petición lenta sobrescriba una elección más reciente.
    saveQueue.current = saveQueue.current.then(async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);
      const response = await fetch("/api/simulator/answer", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, questionId, selectedAnswerId: answerId }),
      }).catch(() => null);
      clearTimeout(timeout);
      if (!response || !response.ok) {
        setError("No se pudo guardar esta respuesta. Intenta seleccionarla de nuevo.");
      }
    });
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className="flex items-baseline justify-between">
        <h1 className="font-display text-3xl text-pizarron">Simulador</h1>
        {remainingSeconds !== null && attemptId && (
          <p className="font-display text-2xl text-acento">{formatTime(remainingSeconds)}</p>
        )}
      </div>

      <SimulatorFormulaSheet />

      {!attemptId && !result && (
        <div className="mt-8">
          <p className="text-sm text-ink/60">
            {SIMULATOR_QUESTION_COUNT} preguntas, {SIMULATOR_TIME_LIMIT_SECONDS / 60} minutos.
            Ejercicios originales de práctica, no una réplica completa del examen oficial. El tiempo
            se controla en el servidor: si cierras la pestaña y vuelves, tu progreso y el tiempo
            restante real se recuperan automáticamente.
          </p>
          <p className="mt-3 text-sm text-ink/60">
            Combina opción múltiple con arrastre en Historia, Biología y algunas preguntas de
            Geometría y Física. No se reutilizan preguntas de tus intentos anteriores, aunque no los
            hayas terminado. Si quedan menos de 60 nuevas, deberás esperar a que ampliemos el banco.
          </p>
          <button
            onClick={startSimulator}
            disabled={loading || recovering}
            className="mt-4 rounded-md bg-pizarron px-4 py-2 text-white transition hover:bg-pizarron/90 disabled:opacity-50"
          >
            {recovering ? "Recuperando progreso…" : loading ? "Cargando…" : "Empezar simulador"}
          </button>
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm text-alerta" role="alert">
          {error}
        </p>
      )}

      {questions.length > 0 && (
        <div className="mt-8 flex flex-col gap-8">
          <p className="text-sm text-ink/60" role="status">
            {Object.keys(selected).length} de {questions.length} preguntas respondidas
          </p>
          <progress
            aria-label="Preguntas respondidas"
            className="h-2 w-full accent-pizarron"
            value={Object.keys(selected).length}
            max={questions.length}
          />
          <label className="flex items-center gap-3 text-sm text-ink/70">
            Ir a pregunta
            <select
              value={currentIndex}
              onChange={(event) => setCurrentIndex(Number(event.target.value))}
              className="min-h-11 rounded-md border border-ink/20 bg-white px-3"
              disabled={loading}
            >
              {questions.map((q, index) => (
                <option key={q.id} value={index}>
                  {index + 1} de {questions.length}
                  {selected[q.id] ? " · Respondida" : " · Pendiente"}
                </option>
              ))}
            </select>
          </label>
          {questions.slice(currentIndex, currentIndex + 1).map((q) => (
            <fieldset key={q.id} className="rounded-md border border-ink/10 bg-white p-4">
              <legend className="px-1 text-sm text-ink/50">
                Pregunta {currentIndex + 1} de {questions.length}
              </legend>
              <p className="font-medium text-ink">{q.text}</p>
              <SimulatorQuestionAnswer
                answerMode={q.answerMode}
                questionId={q.id}
                answers={q.answers}
                selectedId={selected[q.id]}
                disabled={loading || remainingSeconds === 0}
                onSelect={(answerId) => selectAnswer(q.id, answerId)}
              />
            </fieldset>
          ))}

          <div className="flex justify-between gap-3">
            <button
              type="button"
              disabled={currentIndex === 0 || loading}
              onClick={() => setCurrentIndex((index) => index - 1)}
              className="min-h-11 rounded-md border border-ink/20 px-4 text-sm disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={currentIndex === questions.length - 1 || loading}
              onClick={() => setCurrentIndex((index) => index + 1)}
              className="min-h-11 rounded-md border border-ink/20 px-4 text-sm disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>

          <button
            onClick={submitSimulator}
            disabled={loading}
            className="rounded-md bg-pizarron px-4 py-2 text-white transition hover:bg-pizarron/90 disabled:opacity-50"
          >
            {loading ? "Entregando…" : "Entregar simulador"}
          </button>
        </div>
      )}

      {result && (
        <div className="mt-8 rounded-md border border-ink/10 bg-white p-6">
          <p className="font-display text-2xl text-pizarron">{Math.round(result.score)}%</p>
          <p className="mt-1 text-sm text-ink/70">
            {result.correctCount} de {result.totalCount} respuestas correctas.
          </p>
          <button onClick={() => setResult(null)} className="mt-4 text-sm text-pizarron underline">
            Hacer otro simulador
          </button>
        </div>
      )}
    </main>
  );
}
