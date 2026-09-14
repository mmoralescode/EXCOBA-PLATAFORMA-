import Link from "next/link";
import { hasRole } from "@/lib/authorization";
import { requirePageRole } from "@/lib/page-authorization";
import { AdminAccessDenied } from "@/components/admin-access-denied";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Guardia server-side real de autorización. El middleware sólo evita que
  // un visitante sin cookie llegue aquí; ESTA verificación de rol es la que
  // efectivamente protege el panel (ver Módulo 1, sección 10).
  const user = await requirePageRole("SUPER_ADMIN", "EDITOR_ACADEMICO", "SOPORTE", "ANALISTA");
  if (!user) return <AdminAccessDenied />;
  const canReadFeedback = hasRole(user, "SUPER_ADMIN") || hasRole(user, "SOPORTE");

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink/10 bg-white px-6 py-4">
        <p className="font-display text-lg text-pizarron">Panel administrativo — EXCOBA</p>
        <nav
          aria-label="Administración"
          className="mt-2 flex flex-wrap gap-x-6 text-sm text-pizarron"
        >
          <Link href="/admin" className="inline-flex min-h-11 items-center underline">
            Resumen
          </Link>
          {canReadFeedback && (
            <Link href="/admin/feedback" className="inline-flex min-h-11 items-center underline">
              Buzón
            </Link>
          )}
          <Link href="/perfil" className="inline-flex min-h-11 items-center underline">
            Volver a la plataforma
          </Link>
        </nav>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-10">{children}</div>
    </div>
  );
}
