"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!response.ok) {
        setError(
          response.status === 429
            ? "Has realizado demasiadas solicitudes. Espera unos minutos antes de intentarlo de nuevo."
            : "El servicio no está disponible en este momento. Intenta de nuevo en unos minutos.",
        );
        return;
      }
      // Do not echo account-specific responses or claim that an email was delivered.
      setSent(true);
    } catch {
      setError("No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-16">
      <p className="font-display text-sm uppercase tracking-widest text-acento">
        Plataforma EXCOBA
      </p>
      <h1 className="mt-2 font-display text-3xl text-pizarron">Recupera tu contraseña</h1>
      <p className="mt-2 text-sm text-ink/60">
        Ingresa tu correo y, si tienes una cuenta, te enviaremos un enlace para restablecerla.
      </p>

      {!sent ? (
        <form onSubmit={handleSubmit} aria-busy={loading} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-ink/70">
            Correo
            <input
              type="email"
              required
              maxLength={254}
              disabled={loading}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              onBlur={() => setEmail(email.trim())}
              className="rounded-md border border-ink/20 px-3 py-2 text-ink outline-none focus:border-pizarron"
              autoComplete="email"
            />
          </label>

          {error && (
            <p role="alert" className="text-sm text-alerta">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-md bg-pizarron px-4 py-2 text-white transition hover:bg-pizarron/90 disabled:opacity-50"
          >
            {loading ? "Enviando…" : "Enviar enlace"}
          </button>
        </form>
      ) : (
        <div className="mt-8 space-y-4">
          <div
            role="status"
            className="space-y-3 rounded-md bg-aprobado/10 px-4 py-3 text-sm leading-6 text-ink/80"
          >
            <p>
              Si el correo corresponde a una cuenta habilitada y el servicio está disponible,
              recibirás un enlace para restablecer tu contraseña.
            </p>
            <p>
              Revisa también tu carpeta de spam. El enlace tiene vigencia limitada y solo puede
              usarse una vez.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSent(false);
              setError(null);
            }}
            className="min-h-11 text-sm text-pizarron underline"
          >
            Corregir correo o solicitar otro enlace
          </button>
        </div>
      )}

      <Link href="/login" className="mt-6 text-sm text-ink/60 hover:text-pizarron">
        Volver a iniciar sesión
      </Link>
    </main>
  );
}
