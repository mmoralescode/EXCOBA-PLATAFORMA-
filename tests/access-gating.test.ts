import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { middleware, PROTECTED_PREFIXES } from "../src/middleware";
import { safeAuthenticatedPath } from "../src/lib/safe-next-path";

describe("acceso a contenido", () => {
  it.each(["/estudio", "/practica", "/simulador", "/perfil", "/instructivo", "/temario", "/admin"])(
    "redirige %s al login cuando no hay sesión",
    (path) => {
      const response = middleware(new NextRequest(`https://excoba.example${path}`));
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe(
        `https://excoba.example/login?next=${encodeURIComponent(path)}`,
      );
    },
  );

  it.each(["/", "/activar", "/login", "/recuperar-password", "/recuperar-password/confirmar"])(
    "mantiene pública %s",
    (path) => {
      expect(middleware(new NextRequest(`https://excoba.example${path}`)).status).toBe(200);
    },
  );

  it("mantiene todas las páginas internas conocidas en la protección", () => {
    expect(PROTECTED_PREFIXES).toEqual(
      expect.arrayContaining(["/instructivo", "/temario", "/estudio", "/practica", "/simulador"]),
    );
  });
});

describe("retorno después del login", () => {
  it.each(["/estudio", "/practica?area=matematicas", "/instructivo", "/temario", "/perfil"])(
    "acepta el destino interno %s",
    (path) => expect(safeAuthenticatedPath(path)).toBe(path),
  );

  it.each([
    null,
    "",
    "https://evil.example",
    "//evil.example",
    "/activar",
    "/estudio/../../activar",
  ])("rechaza un destino no autorizado", (path) =>
    expect(safeAuthenticatedPath(path)).toBe("/estudio"),
  );
});
