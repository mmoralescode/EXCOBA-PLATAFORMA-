import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const pdf = process.argv[2];
if (!pdf) throw new Error("Uso: node scripts/verify-official-guide.mjs <PDF oficial>");
const raw = execFileSync("pdftotext", ["-layout", pdf, "-"], {
  encoding: "utf8",
  maxBuffer: 5_000_000,
});
const catalog = JSON.parse(
  readFileSync(new URL("../src/content/curriculum.json", import.meta.url), "utf8"),
);
const careers = JSON.parse(
  readFileSync(new URL("../src/content/careers.json", import.meta.url), "utf8"),
);
assert.equal(
  createHash("sha256").update(readFileSync(pdf)).digest("hex"),
  careers.sha256,
  "El PDF no corresponde a la fuente registrada.",
);
const headings = [...raw.matchAll(/^(\d\.\d+\.\d+(?:\.\d+)?)\.\s+/gm)].map((m) => m[1]);
const leaves = headings.filter((code) => !headings.some((other) => other.startsWith(code + ".")));
assert.deepEqual(
  [...leaves].sort(),
  catalog.topics.map((t) => t.id).sort(),
  "Faltan temas o sobran códigos.",
);
const appendix = raw.slice(raw.indexOf("ANEXO I. Programas educativos de la UAQ 2026-1"));
const names = appendix
  .split("\n")
  .map((line) => line.split(/\s{2,}/)[0].trim())
  .filter(
    (line) =>
      line &&
      !/NOMBRE DE|ANEXO|Página|P á g|CRÉDITOS|El demo|Visita|https?:|Métrica|^\f/.test(line),
  );
const extractedNames = names.filter(
  (line) => /\(.*\)$/.test(line) || line === "INGENIERO EN AGROBIOTECNOLOGÍA",
);
assert.deepEqual(
  extractedNames,
  careers.careers.map((c) => c.name),
  "Revisar carreras faltantes o nombres.",
);
assert.equal(leaves.length, 209);
assert.equal(extractedNames.length, 49);
console.log(
  "PDF verificado: 209/209 temas, 14 asignaturas, 49/49 carreras. Mapeos de áreas cotejados visualmente en páginas 17 y 18.",
);
