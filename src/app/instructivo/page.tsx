import Link from "next/link";
import { CurriculumBrowser } from "@/components/curriculum-browser";

export default function InstructivoPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <Link href="/" className="text-sm text-pizarron underline">
        ← Inicio
      </Link>
      <p className="mt-8 font-display text-sm uppercase tracking-widest text-acento">
        EXCOBA · UAQ 2026-1
      </p>
      <h1 className="mt-2 font-display text-3xl text-pizarron">Tu instructivo, por temas</h1>
      <p className="mt-3 leading-7 text-ink/75">
        Incluye todos los temas del instructivo oficial EXCOBA: 209 apartados de 14 asignaturas,
        organizados en primaria, secundaria y bachillerato.
      </p>
      <details className="mt-6 rounded-xl border border-ink/10 bg-white p-4">
        <summary className="cursor-pointer font-medium text-pizarron">
          Cómo es el examen y cómo practicar aquí
        </summary>
        <div className="mt-4 space-y-3 text-sm leading-6 text-ink/75">
          <p>
            El examen reúne 180 preguntas: 40 de primaria, 80 de secundaria y 60 de las tres
            asignaturas de bachillerato que corresponden a tu carrera.
          </p>
          <p>
            Las respuestas oficiales son semiconstruidas: arrastrar elementos, seleccionar elementos
            en textos o imágenes y escribir expresiones numéricas o algebraicas. Una pregunta puede
            requerir una o varias respuestas y admitir puntuación parcial.
          </p>
          <p>
            Organiza tu tiempo: la guía recomienda alrededor de un minuto por pregunta y volver al
            final a las que requieran más trabajo. El demo oficial contiene 45 preguntas para
            conocer la interfaz; no es el temario completo.
          </p>
          <p>
            Aquí practicas con ejercicios propios de opción múltiple y calificación de la
            plataforma. El catálogo cubre todos los temas; el banco de ejercicios todavía no cubre
            cada uno ni reproduce todos los formatos oficiales.
          </p>
        </div>
      </details>
      <CurriculumBrowser />
      <p className="mt-8 text-xs leading-5 text-ink/50">
        Fuente: instructivo EXCOBA-UAQ Licenciatura adjunto, guía temática (páginas 4–16) y Anexo I
        UAQ 2026-1 (páginas 17–18). El índice del PDF conserva una referencia a 2025-1; la tabla del
        Anexo I está titulada 2026-1.
      </p>
      <Link href="/" className="mt-6 inline-block text-sm text-pizarron underline">
        Elegir carrera y continuar →
      </Link>
    </main>
  );
}
