import { formulaSheet } from "@/content/formula-sheet";

export function SimulatorFormulaSheet() {
  return (
    <details className="mt-6 rounded-lg border border-ink/15 bg-white p-4">
      <summary className="cursor-pointer font-medium text-pizarron">
        Formulario · Física, Química y Matemáticas
      </summary>
      <p className="mt-3 text-xs leading-5 text-ink/60">
        Apoyo general de nuestra plataforma: fórmulas, símbolos y unidades. No contiene respuestas
        ni soluciones. Consultarlo no pausa el cronómetro.
      </p>
      <div
        className="mt-4 max-h-80 space-y-5 overflow-y-auto pr-2"
        tabIndex={0}
        role="region"
        aria-label="Fórmulas de consulta"
      >
        {formulaSheet.map(({ subject, formulas }) => (
          <section key={subject}>
            <h2 className="font-display text-xl text-pizarron">{subject}</h2>
            <dl className="mt-3 space-y-3">
              {formulas.map(([name, formula, meaning]) => (
                <div key={name}>
                  <dt className="text-xs font-medium text-ink/60">{name}</dt>
                  <dd className="mt-1 break-words text-sm text-ink">
                    {formula}
                    <span className="mt-1 block text-xs leading-5 text-ink/60">{meaning}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </details>
  );
}
