import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findUser: vi.fn(),
  update: vi.fn(),
  audit: vi.fn(),
  transaction: vi.fn(),
}));
vi.mock("../src/db/client", () => ({
  db: {
    user: { findUnique: mocks.findUser },
    $transaction: mocks.transaction,
  },
}));

import { PrivacyNoticeConfigurationError, privacyNoticeDetails } from "../src/lib/privacy-notice";
import { PRIVACY_NOTICE_VERSION } from "../src/content/privacy-notice-version";
import {
  acceptPrivacyNotice,
  PrivacyNoticeAcceptanceError,
} from "../src/server/use-cases/accept-privacy-notice";

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("PRIVACY_CONTROLLER_NAME", "Responsable EXCOBA");
  vi.stubEnv("PRIVACY_CONTROLLER_ADDRESS", "Calle Uno 1, Querétaro, Qro., 76000");
  vi.stubEnv("PRIVACY_CONTACT_EMAIL", "privacidad@example.com");
  mocks.transaction.mockImplementation(async (callback) =>
    callback({ user: { update: mocks.update }, auditLog: { create: mocks.audit } }),
  );
});
afterEach(() => vi.unstubAllEnvs());

describe("aviso de privacidad", () => {
  it("requiere que el responsable, domicilio y contacto estén configurados", () => {
    expect(privacyNoticeDetails()).toEqual({
      controllerName: "Responsable EXCOBA",
      controllerAddress: "Calle Uno 1, Querétaro, Qro., 76000",
      contactEmail: "privacidad@example.com",
    });
    vi.stubEnv("PRIVACY_CONTACT_EMAIL", "");
    expect(() => privacyNoticeDetails()).toThrow(PrivacyNoticeConfigurationError);
  });

  it("guarda una sola constancia con fecha y versión vigente", async () => {
    const acceptedAt = new Date("2026-09-13T12:00:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(acceptedAt);
    mocks.findUser.mockResolvedValue({ privacyNoticeAcceptedAt: null, privacyNoticeVersion: null });

    await expect(acceptPrivacyNotice("user-1")).resolves.toEqual({
      acceptedAt,
      alreadyAccepted: false,
    });
    expect(mocks.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { privacyNoticeAcceptedAt: acceptedAt, privacyNoticeVersion: PRIVACY_NOTICE_VERSION },
    });
    expect(mocks.audit).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: "user-1",
        action: "PRIVACY_NOTICE_ACCEPTED",
        metadata: { version: PRIVACY_NOTICE_VERSION },
      }),
    });
    vi.useRealTimers();
  });

  it("no reescribe la fecha cuando el usuario ya aceptó esta versión", async () => {
    const acceptedAt = new Date("2026-09-13T12:00:00.000Z");
    mocks.findUser.mockResolvedValue({
      privacyNoticeAcceptedAt: acceptedAt,
      privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
    });
    await expect(acceptPrivacyNotice("user-1")).resolves.toEqual({
      acceptedAt,
      alreadyAccepted: true,
    });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("rechaza una aceptación para un usuario inexistente", async () => {
    mocks.findUser.mockResolvedValue(null);
    await expect(acceptPrivacyNotice("unknown")).rejects.toBeInstanceOf(
      PrivacyNoticeAcceptanceError,
    );
  });
});
