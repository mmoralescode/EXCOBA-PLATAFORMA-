import { CurriculumBrowser } from "@/components/curriculum-browser";

export default function TemarioPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-display text-sm uppercase tracking-widest text-acento">
        Plataforma EXCOBA
      </p>
      <h1 className="mt-2 font-display text-3xl text-pizarron">
        Temario completo y banco de ejercicios
      </h1>
      <p className="mt-3 text-sm text-ink/70">
        Consulta los 209 temas integrados antes de activar tu folio. Después de crear tu cuenta
        podrás practicar y revisar las explicaciones dentro de la plataforma.
      </p>
      <CurriculumBrowser />
    </main>
  );
}