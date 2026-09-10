"use client";

import Link from "next/link";
import { CareerSelector, useCareer } from "./career-selector";

export function HomeStart() {
  const { career, choose } = useCareer();
  return (
    <section className="space-y-5 rounded-xl border border-ink/10 bg-white p-5 sm:p-6">
      <CareerSelector value={career?.id ?? ""} onChange={choose} />
      {career ? (
        <Link
          href="/practica"
          className="inline-flex min-h-11 items-center gap-3 rounded-lg bg-pizarron px-5 py-3 text-white"
        >
          Continuar <span aria-hidden="true">→</span>
        </Link>
      ) : (
        <p className="text-sm text-ink/60">Elige tu carrera para preparar tu práctica.</p>
      )}
    </section>
  );
}
