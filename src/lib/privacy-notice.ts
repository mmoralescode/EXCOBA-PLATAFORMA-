export {
  PRIVACY_NOTICE_UPDATED_AT,
  PRIVACY_NOTICE_VERSION,
} from "@/content/privacy-notice-version";

export type PrivacyNoticeDetails = {
  controllerName: string;
  controllerAddress: string;
  contactEmail: string;
};

function requiredEnvironmentValue(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new PrivacyNoticeConfigurationError(name);
  return value;
}

export class PrivacyNoticeConfigurationError extends Error {
  constructor(variableName: string) {
    super(`Falta configurar ${variableName} para publicar el aviso de privacidad.`);
    this.name = "PrivacyNoticeConfigurationError";
  }
}

/** Datos públicos del responsable, configurados por separado de datos de alumnos. */
export function privacyNoticeDetails(): PrivacyNoticeDetails {
  return {
    controllerName: requiredEnvironmentValue("PRIVACY_CONTROLLER_NAME"),
    controllerAddress: requiredEnvironmentValue("PRIVACY_CONTROLLER_ADDRESS"),
    contactEmail: requiredEnvironmentValue("PRIVACY_CONTACT_EMAIL"),
  };
}
