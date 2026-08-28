/**
 * Envoltorio del servicio de correo transaccional. El proveedor real
 * (Resend, Postmark, SMTP genérico, etc.) se conecta aquí según
 * `EMAIL_PROVIDER` en `.env`; en desarrollo, si no hay proveedor
 * configurado, el correo se registra en consola en vez de enviarse.
 *
 * Mantener esta capa de indirección permite cambiar de proveedor sin tocar
 * los casos de uso que la invocan (registro, recuperación de contraseña,
 * asignación de licencias).
 */
export async function sendEmail(to: string, subject: string, body: string) {
  const provider = process.env.EMAIL_PROVIDER ?? "console";

  if (provider === "console" || process.env.NODE_ENV !== "production") {
    console.warn(`[email:${provider}] Para: ${to} | Asunto: ${subject}\n${body}`);
    return;
  }

  // Punto de integración real con el proveedor SMTP/API configurado.
  // Se implementa al elegir proveedor definitivo (fuera del alcance del MVP
  // funcional cubierto en estos módulos).
  throw new Error(`Proveedor de correo "${provider}" no implementado todavía.`);
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const url = `${process.env.APP_URL}/recuperar-password/confirmar?token=${token}`;
  await sendEmail(
    to,
    "Recupera tu contraseña — Plataforma EXCOBA",
    `Para restablecer tu contraseña visita este enlace (válido 30 minutos): ${url}`,
  );
}

export async function sendLicenseAssignedEmail(to: string, folio: string) {
  await sendEmail(
    to,
    "Tu folio de acceso — Plataforma EXCOBA",
    `Tu folio de activación es: ${folio}\nActívalo en: ${process.env.APP_URL}/activar`,
  );
}
