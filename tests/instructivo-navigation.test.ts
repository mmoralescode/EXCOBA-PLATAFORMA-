import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ session: vi.fn(), redirect: vi.fn() }));
vi.mock("../src/lib/session", () => ({ getSessionUser: mocks.session }));
vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

import AlumnoLayout from "../src/app/(alumno)/layout";
import InstructivoPage from "../src/app/(alumno)/instructivo/page";
import TemarioPage from "../src/app/(alumno)/temario/page";
import { ProtectedCurriculumPage } from "../src/components/protected-curriculum-page";
import { PRIVACY_NOTICE_VERSION } from "../src/content/privacy-notice-version";

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("React", React);
  mocks.session.mockResolvedValue({ id: "alumno-con-sesion-valida" });
  mocks.redirect.mockImplementation((path: string) => {
    throw new Error(`redirect:${path}`);
  });
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("Instructivo dentro de la cuenta del alumno", () => {
  it("muestra el mensaje sin requerir datos de identidad del responsable", async () => {
    const html = renderToStaticMarkup(await AlumnoLayout({ children: "contenido" }));
    expect(html).toContain('id="privacy-notice-title"');
    expect(html).toContain("He leído y acepto este mensaje");
  });
  it("deja de mostrar el mensaje para una cuenta que ya lo aceptó", async () => {
    mocks.session.mockResolvedValue({
      id: "user-1",
      privacyNoticeAcceptedAt: new Date(),
      privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
    });
    for (let visit = 0; visit < 2; visit++) {
      const html = renderToStaticMarkup(await AlumnoLayout({ children: "contenido" }));
      expect(html).not.toContain('id="privacy-notice-title"');
      expect(html).toContain('href="/privacidad"');
    }
  });
  it("vuelve a mostrar únicamente versiones nuevas o registros incompletos", async () => {
    for (const record of [
      { privacyNoticeAcceptedAt: new Date(), privacyNoticeVersion: "anterior" },
      { privacyNoticeAcceptedAt: null, privacyNoticeVersion: PRIVACY_NOTICE_VERSION },
    ]) {
      mocks.session.mockResolvedValue({ id: "user-1", ...record });
      const html = renderToStaticMarkup(await AlumnoLayout({ children: "contenido" }));
      expect(html).toContain('id="privacy-notice-title"');
    }
  });
  it.each([
    ["/instructivo", InstructivoPage],
    ["/temario", TemarioPage],
  ] as const)(
    "mantiene la navegación del alumno en %s sin enviarlo a la portada",
    async (path, Page) => {
      const page = await Page();
      expect(page.type).toBe(ProtectedCurriculumPage);
      const content = await ProtectedCurriculumPage(page.props);
      const html = renderToStaticMarkup(await AlumnoLayout({ children: content }));
      expect(html).toContain("Tu instructivo, por temas");
      expect(html).toContain('href="/instructivo"');
      expect(html).toContain('href="/practica"');
      expect(html).toContain('href="/estudio"');
      expect(html).not.toContain('href="/"');
      expect(mocks.redirect).not.toHaveBeenCalled();
    },
  );

  it("sigue rechazando el acceso al instructivo cuando la sesión no es válida", async () => {
    mocks.session.mockResolvedValue(null);
    await expect(ProtectedCurriculumPage({ returnPath: "/instructivo" })).rejects.toThrow(
      "redirect:/login?next=%2Finstructivo",
    );
  });
});
