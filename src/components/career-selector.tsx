"use client";

import { useEffect, useId, useState } from "react";
import { careers, CAREER_COOKIE, getCareer } from "@/content/career-catalog";
import { subjectName } from "@/content/subject-catalog";
import sourceCatalog from "@/content/career-sources.json";

const careerSources = sourceCatalog.careers as Record<
  string,
  { sourceId: string; aliases: string[] }
>;
const sources = sourceCatalog.sources as Record<string, { title: string; url: string | null }>;

const normalizeSearch = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .trim();
const sortedCareers = [...careers].sort((a, b) => a.name.localeCompare(b.name, "es"));

export function CareerSourceNote({
  careerId,
  historicalOnly = false,
}: {
  careerId: string;
  historicalOnly?: boolean;
}) {
  const sourceId = careerSources[careerId]?.sourceId;
  const source = sourceId ? sources[sourceId] : null;
  const historical = sourceId !== "uaq-2026-2";
  if (!source || (historicalOnly && !historical)) return null;
  return (
    <p
      className={`text-xs leading-5 ${historical ? "rounded-lg border border-acento/30 bg-white p-3 text-ink/75" : "text-ink/50"}`}
    >
      Áreas según{" "}
      {source.url ? (
        <a href={source.url} target="_blank" rel="noreferrer" className="underline">
          {source.title}
        </a>
      ) : (
        source.title
      )}
      .
      {historical &&
        " Referencia de un ciclo anterior: este programa no aparece en el Anexo 2026-2. Confirma las áreas y la apertura de ingreso con tu facultad."}
    </p>
  );
}

export function useCareer() {
  const [careerId, setCareerId] = useState("");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const read = () => {
      const value = document.cookie
        .split("; ")
        .find((entry) => entry.startsWith(CAREER_COOKIE + "="))
        ?.split("=")[1];
      setCareerId(getCareer(value)?.id ?? "");
      setReady(true);
    };
    read();
    window.addEventListener("excoba:career", read);
    return () => window.removeEventListener("excoba:career", read);
  }, []);
  function choose(id: string) {
    const valid = getCareer(id)?.id ?? "";
    document.cookie = `${CAREER_COOKIE}=${valid}; Path=/; Max-Age=${valid ? 31536000 : 0}; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
    setCareerId(valid);
    window.dispatchEvent(new Event("excoba:career"));
  }
  return { career: getCareer(careerId), choose, ready };
}

export function CareerSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const id = useId();
  const [search, setSearch] = useState("");
  const career = getCareer(value);
  const matches = sortedCareers.filter((item) =>
    [item.name, ...(careerSources[item.id]?.aliases ?? [])].some((name) =>
      normalizeSearch(name).includes(normalizeSearch(search)),
    ),
  );
  const keepSelection = career && !matches.some((item) => item.id === career.id);
  return (
    <div className="space-y-3">
      <label htmlFor={`${id}-search`} className="sr-only">
        Buscar carrera o campus
      </label>
      <input
        id={`${id}-search`}
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Buscar carrera o campus, por ejemplo: Actuaría"
        autoComplete="off"
        aria-describedby={`${id}-results`}
        className="w-full rounded-lg border border-ink/20 bg-white p-3 text-sm focus:outline-pizarron"
      />
      <select
        id={id}
        aria-label="Carrera"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setSearch("");
        }}
        className="w-full min-w-0 rounded-lg border border-ink/20 bg-white p-3 text-sm focus:outline-pizarron"
      >
        <option value="">Selecciona tu carrera</option>
        {keepSelection && (
          <optgroup label="Carrera seleccionada">
            <option value={career.id}>{career.name}</option>
          </optgroup>
        )}
        {matches.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
      <p id={`${id}-results`} role="status" className="text-xs text-ink/50">
        {matches.length
          ? `${matches.length} opciones de carrera y campus${search ? " encontradas" : " disponibles"}.`
          : "No hay coincidencias. Prueba con otro nombre o campus."}
      </p>
      {career && (
        <div className="space-y-2 text-sm leading-6 text-ink/70">
          <p>
            Tus tres áreas de bachillerato:{" "}
            {career.subjectIds
              .map((subjectId) => subjectName(subjectId)?.split(" · ")[1])
              .filter(Boolean)
              .join(", ")}
            .
          </p>
          <p>
            También debes estudiar primaria y secundaria: son la base común del examen para todas
            las carreras.
          </p>
        </div>
      )}
      {career && <CareerSourceNote careerId={career.id} />}
      <p className="text-xs text-ink/50">
        Catálogo de carreras y campus, no de convocatorias abiertas. La elección se guarda en este
        navegador.
      </p>
    </div>
  );
}
