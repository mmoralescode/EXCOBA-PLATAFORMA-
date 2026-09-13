"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PrivacyNoticeDetails } from "@/lib/privacy-notice";
import { PrivacyNoticeContent } from "./privacy-notice-content";

export function PrivacyNoticeDialog({ details }: { details: PrivacyNoticeDetails }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function accept() {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/privacy/accept", { method: "POST" });
      if (!response.ok) throw new Error();
      router.refresh();
    } catch {
      setError("No pudimos registrar tu aceptación. Intenta de nuevo.");
      setSubmitting(false);
    }
  }

  return (
    <div
      aria-labelledby="privacy-notice-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end bg-ink/45 p-0 sm:items-center sm:p-6"
      role="dialog"
    >
      <section className="max-h-[92vh] w-full overflow-y-auto rounded-t-xl bg-paper p-6 shadow-xl sm:mx-auto sm:max-w-3xl sm:rounded-xl sm:p-8">
        <p className="font-display text-sm uppercase tracking-widest text-acento">
          Plataforma EXCOBA
        </p>
        <h1 id="privacy-notice-title" className="mt-2 font-display text-3xl text-pizarron">
          Aviso de privacidad
        </h1>
        <p className="mt-3 text-sm leading-6 text-ink/70">
          Léelo antes de continuar. Guardaremos la fecha y versión de tu aceptación.
        </p>
        <div className="mt-6 border-y border-ink/10 py-6">
          <PrivacyNoticeContent details={details} />
        </div>
        {error && (
          <p className="mt-4 text-sm text-alerta" role="alert">
            {error}
          </p>
        )}
        <button
          className="mt-6 min-h-11 w-full rounded-lg bg-pizarron px-5 py-3 text-white disabled:opacity-50"
          disabled={submitting}
          onClick={accept}
          type="button"
        >
          {submitting ? "Guardando…" : "He leído y acepto el aviso de privacidad"}
        </button>
      </section>
    </div>
  );
}
