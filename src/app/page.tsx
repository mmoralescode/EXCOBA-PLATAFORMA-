import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-24">
      <p className="font-display text-sm uppercase tracking-widest text-acento">
        Plataforma EXCOBA
      </p>
      <h1 className="font-display text-4xl leading-tight text-pizarron sm:text-5xl">
        Prepárate para el examen de admisión a la UAQ.
      </h1>
      <p className="max-w-xl text-lg text-ink/80">
        Estudio por materia y tema, práctica calificada y simuladores
        cronometrados, basados en la guía EXCOBA.
      </p>

      <div className="mt-4 flex gap-4">
        <Link
          href="/activar"
          className="rounded-md bg-pizarron px-5 py-3 text-white transition hover:bg-pizarron/90"
        >
          Tengo un folio — crear cuenta
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-ink/20 px-5 py-3 text-ink transition hover:border-pizarron"
        >
          Ya tengo cuenta
        </Link>
      </div>
    </main>
  );
}
