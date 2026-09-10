"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ActivarPage() {
  const router = useRouter();
  const [step, setStep] = useState<"folio" | "registro">("folio");
  const [folio, setFolio] = useState("");
  const [licenseId, setLicenseId] = useState<string | null>(null);
  const [validityMonths, setValidityMonths] = useState<number | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleValidateFolio(event: FormEvent) {
    event.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/licenses/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folio: folio.trim().toUpperCase() }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "El folio no es válido.");
        return;
      }

      setLicenseId(data.licenseId);
      setValidityMonths(typeof data.validityMonths === "number" ? data.validityMonths : null);
      setExpiresAt(typeof data.expiresAt === "string" ? data.expiresAt : null);
      setStep("registro");
    } catch {
      setError("No se pudo conectar con el servidor. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(event: FormEvent) {
    event.preventDefault();
    if (loading || !licenseId) return;
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          licenseId,
          folio: folio.trim().toUpperCase(),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? "No fue posible completar el registro.");
        return;
      }

      // El registro no inicia sesión automáticamente; lo mandamos a login
      // con el correo pre-cargado sería una mejora futura de UX.
      router.push("/login");
    } catch {
      setError("No se pudo conectar con el servidor. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-16">
      <p className="font-display text-sm uppercase tracking-widest text-acento">
        Plataforma EXCOBA
      </p>
      <h1 className="mt-2 font-display text-3xl text-pizarron">
        {step === "folio" ? "Activa tu folio" : "Crea tu cuenta"}
      </h1>
      <p className="mt-2 text-sm text-ink/60">
        {step === "folio"
          ? "Ingresa el folio que recibiste para comenzar."
          : "Tu folio es válido. Completa tus datos para terminar."}
      </p>

      {step === "folio" && (
        <p className="mt-3 text-sm leading-6 text-ink/70">
          Los folios semestrales nuevos incluyen 6 meses naturales de acceso. El plazo comienza
          cuando creas tu cuenta, no cuando recibes el folio.
        </p>
      )}
      {step === "registro" && validityMonths === 6 && (
        <p className="mt-4 rounded-md border border-ink/10 bg-white p-3 text-sm leading-6 text-ink/75">
          Tu acceso dura 6 meses naturales desde la activación. El plazo comienza al completar este
          registro; tu fecha exacta de vencimiento aparecerá en tu perfil.
        </p>
      )}
      {step === "registro" &&
        validityMonths !== 6 &&
        expiresAt &&
        !Number.isNaN(Date.parse(expiresAt)) && (
          <p className="mt-4 text-sm leading-6 text-ink/70">
            Este folio conserva su vigencia hasta el{" "}
            {new Date(expiresAt).toLocaleDateString("es-MX", {
              dateStyle: "long",
              timeZone: "America/Mexico_City",
            })}
            .
          </p>
        )}

      {step === "folio" && (
        <form
          onSubmit={handleValidateFolio}
          aria-busy={loading}
          className="mt-8 flex flex-col gap-4"
        >
          <label className="flex flex-col gap-1 text-sm text-ink/70">
            Folio
            <input
              type="text"
              required
              minLength={10}
              maxLength={32}
              disabled={loading}
              autoComplete="off"
              placeholder="EXCOBA-XXXX-XXXX"
              value={folio}
              onChange={(e) => setFolio(e.target.value)}
              className="rounded-md border border-ink/20 px-3 py-2 font-mono text-ink outline-none focus:border-pizarron"
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
            {loading ? "Validando…" : "Continuar"}
          </button>
        </form>
      )}

      {step === "registro" && (
        <form onSubmit={handleRegister} aria-busy={loading} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-ink/70">
            Nombre completo
            <input
              type="text"
              required
              disabled={loading}
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-md border border-ink/20 px-3 py-2 text-ink outline-none focus:border-pizarron"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-ink/70">
            Correo
            <input
              type="email"
              required
              maxLength={254}
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmail(email.trim())}
              className="rounded-md border border-ink/20 px-3 py-2 text-ink outline-none focus:border-pizarron"
              autoComplete="email"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-ink/70">
            Contraseña (de 10 a 128 caracteres)
            <input
              type="password"
              required
              minLength={10}
              maxLength={128}
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border border-ink/20 px-3 py-2 text-ink outline-none focus:border-pizarron"
              autoComplete="new-password"
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
            {loading
              ? "Creando cuenta…"
              : validityMonths === 6
                ? "Crear cuenta y activar acceso"
                : "Crear cuenta"}
          </button>
        </form>
      )}

      <Link href="/login" className="mt-6 text-sm text-ink/60 hover:text-pizarron">
        Ya tengo cuenta — iniciar sesión
      </Link>
      <Link href="/temario" className="mt-3 text-sm text-pizarron underline hover:text-acento">
        Explorar el temario completo y los ejercicios
      </Link>
    </main>
  );
}
