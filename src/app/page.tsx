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
        cronometrados, basados en la guía EXCOBA. Esta página es el punto de
        partida del proyecto (Módulo 2); el contenido, la activación de folio
        y el resto de las funciones se incorporan en los módulos siguientes.
      </p>
    </main>
  );
}
