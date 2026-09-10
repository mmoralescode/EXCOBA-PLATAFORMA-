"use client";

import Link from "next/link";
import { CareerSelector, useCareer } from "./career-selector";

export function HomeStart({ hasAccess = false }: { hasAccess?: boolean }) {
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
      {ready && career && hasAccess ? (
        <Link
          href="/estudio"
          className="inline-flex min-h-11 items-center gap-3 rounded-lg bg-pizarron px-5 py-3 text-white"
        >
          Ver mi plan de estudio <span aria-hidden="true">→</span>
        </Link>
      ) : ready && career ? (
        <div className="space-y-3 border-t border-ink/10 pt-5">
          <p className="text-sm leading-6 text-ink/70">
            Tu carrera quedó seleccionada. Para consultar el instructivo, estudiar o practicar,
            canjea tu folio o entra con tu cuenta.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/activar"
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-pizarron px-5 py-3 text-white"
            >
              Canjear mi folio
            </Link>
            <Link
              href="/login?next=%2Festudio"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-pizarron px-5 py-3 text-pizarron"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      ) : ready ? (
        <p className="text-sm text-ink/60">
          Elige tu carrera para ver los temas que debes estudiar.
        </p>
      ) : null}
    </section>
  );
}
