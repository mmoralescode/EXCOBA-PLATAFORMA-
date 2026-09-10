"use client";

import Link from "next/link";
import { CareerSelector, useCareer } from "./career-selector";

export function HomeStart() {
  const { career, choose, ready } = useCareer();
  return (
    <section className="space-y-5 rounded-xl border border-ink/10 bg-white p-5 sm:p-6">
      {!ready ? (
        <p role="status" className="text-sm text-ink/60">
          Cargando tu selección…
        </p>
      ) : (
        <CareerSelector value={career?.id ?? ""} onChange={choose} />
      )}
      {ready && career ? (
        <Link
          href="/estudio"
          className="inline-flex min-h-11 items-center gap-3 rounded-lg bg-pizarron px-5 py-3 text-white"
        >
          Ver mi plan de estudio <span aria-hidden="true">→</span>
        </Link>
      ) : ready ? (
        <p className="text-sm text-ink/60">
          Elige tu carrera para ver los temas que debes estudiar.
        </p>
      ) : null}
    </section>
  );
}
