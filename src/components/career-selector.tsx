"use client";

import { useEffect, useId, useState } from "react";
import { careers, CAREER_COOKIE, getCareer, officialSubjects } from "@/content/study-plan";

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
  const career = getCareer(value);
  return (
    <div className="space-y-3">
      <label htmlFor={id} className="block font-medium text-pizarron">
        ¿A qué carrera quieres ingresar?
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full min-w-0 rounded-lg border border-ink/20 bg-white p-3 text-sm focus:outline-pizarron"
      >
        <option value="">Selecciona tu carrera</option>
        {careers.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
      {career && (
        <p className="text-sm leading-6 text-ink/70">
          Tus áreas de bachillerato:{" "}
          {career.subjectIds
            .map(
              (subjectId) =>
                officialSubjects.find((subject) => subject.id === subjectId)!.name.split(" · ")[1],
            )
            .join(", ")}
          .
        </p>
      )}
      <p className="text-xs text-ink/50">
        Carreras del Anexo I UAQ 2026-1. La elección se guarda en este navegador.
      </p>
    </div>
  );
}
