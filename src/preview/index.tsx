import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { CurriculumBrowser } from "../components/curriculum-browser";
import { QuestionBank } from "../components/question-bank";

function Preview() {
  const [route, setRoute] = useState(location.hash.slice(1) || "/estudio");
  useEffect(() => {
    const update = () => {
      setRoute(location.hash.slice(1) || "/estudio");
      window.scrollTo(0, 0);
    };
    const navigate = (event: MouseEvent) => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
        return;
      const link = (event.target as Element).closest("a");
      const href = link?.getAttribute("href");
      if (href && /^\/(estudio|banco)(\?|$)/.test(href)) {
        event.preventDefault();
        location.hash = href;
      }
    };
    window.addEventListener("hashchange", update);
    document.addEventListener("click", navigate, true);
    return () => {
      window.removeEventListener("hashchange", update);
      document.removeEventListener("click", navigate, true);
    };
  }, []);
  const url = new URL(route, "https://preview.invalid");
  return (
    <>
      <header className="border-b border-ink/10 bg-white">
        <nav
          className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 px-6 py-5"
          aria-label="Navegación principal"
        >
          <a href="#/estudio" className="font-display text-xl text-pizarron">
            EXCOBA · UAQ 2026
          </a>
          <div className="flex gap-5 text-sm text-pizarron">
            <a href="#/estudio" className="underline">
              Temario
            </a>
            <a href="#/banco" className="underline">
              Practicar
            </a>
          </div>
        </nav>
      </header>
      <p className="mx-auto mt-5 max-w-3xl px-6 text-sm text-ink/70">
        Versión de prueba · Temario y práctica con explicaciones. Los resultados de esta prueba no
        se guardan en una cuenta.
      </p>
      {url.pathname === "/banco" ? (
        <QuestionBank key={route} initialTopic={url.searchParams.get("tema") ?? ""} />
      ) : (
        <main className="mx-auto max-w-3xl px-6 py-10">
          <h1 className="font-display text-3xl text-pizarron">Tu ruta de estudio EXCOBA</h1>
          <CurriculumBrowser />
        </main>
      )}
      <footer className="mx-auto max-w-3xl px-6 py-8 text-sm text-ink/60">
        Material independiente de preparación. Los ejercicios nuevos no son preguntas oficiales del
        examen.
      </footer>
    </>
  );
}

createRoot(document.getElementById("root")!).render(<Preview />);
