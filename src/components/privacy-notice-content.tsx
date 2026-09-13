"use client";

import type { PrivacyNoticeDetails } from "@/lib/privacy-notice";
import {
  PRIVACY_NOTICE_UPDATED_AT,
  PRIVACY_NOTICE_VERSION,
} from "@/content/privacy-notice-version";

export function PrivacyNoticeContent({ details }: { details: PrivacyNoticeDetails }) {
  return (
    <div className="space-y-6 text-sm leading-6 text-ink/75">
      <section className="space-y-2">
        <h2 className="font-display text-xl text-pizarron">Responsable y contacto</h2>
        <p>
          <strong>{details.controllerName}</strong>, con domicilio en {details.controllerAddress},
          es responsable del tratamiento de los datos personales obtenidos mediante Plataforma
          EXCOBA. Para dudas, solicitudes o para limitar el uso de tus datos, escribe a{" "}
          <a className="text-pizarron underline" href={`mailto:${details.contactEmail}`}>
            {details.contactEmail}
          </a>
          .
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-xl text-pizarron">Datos que tratamos</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Identidad y contacto: nombre completo y correo electrónico.</li>
          <li>Acceso: contraseña en formato hash, sesiones y agente de navegador.</li>
          <li>Licencia: hash del folio, últimos cuatro caracteres, estado y vigencia.</li>
          <li>
            Uso académico: carrera seleccionada, ejercicios contestados, resultados, avance y
            recomendaciones de estudio.
          </li>
          <li>
            Seguridad: datos técnicos necesarios para prevenir intentos automatizados y proteger el
            acceso.
          </li>
        </ul>
        <p>No solicitamos datos personales sensibles.</p>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-xl text-pizarron">Finalidades necesarias</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Crear y administrar tu cuenta, licencia y autenticación.</li>
          <li>Proporcionar el instructivo, prácticas, simuladores y seguimiento de avance.</li>
          <li>Calcular recomendaciones de estudio a partir de tu desempeño.</li>
          <li>Atender recuperación de contraseña, soporte y comunicaciones operativas.</li>
          <li>Prevenir fraude, abuso, accesos no autorizados e incidentes de seguridad.</li>
          <li>Cumplir obligaciones legales y conservar evidencia de operaciones relevantes.</li>
        </ul>
        <p>
          No usamos tus datos para publicidad, mercadotecnia ni prospección comercial; por ello no
          hay finalidades secundarias que debas rechazar.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-xl text-pizarron">Encargados y transferencias</h2>
        <p>
          Utilizamos proveedores que tratan datos por nuestra cuenta para operar la plataforma:
          Vercel, Inc. para alojamiento y seguridad; Neon, Inc. para la base de datos; y Resend,
          Inc. cuando se habilitan correos transaccionales. No vendemos ni cedemos tus datos a
          terceros para fines comerciales.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-xl text-pizarron">Conservación y seguridad</h2>
        <p>
          Conservamos tus datos mientras tu cuenta y relación con la plataforma estén vigentes y,
          después, durante los plazos necesarios para atender obligaciones legales, reclamaciones o
          seguridad. Al finalizar esos plazos se suprimirán o anonimizarán conforme corresponda.
          Aplicamos controles de acceso, cifrado en tránsito, contraseñas con hash y sesiones
          revocables.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-xl text-pizarron">Derechos ARCO y limitación de uso</h2>
        <p>
          Puedes solicitar acceso, rectificación, cancelación u oposición al tratamiento de tus
          datos, o pedir limitar su uso, escribiendo a {details.contactEmail}. Incluye tu nombre, un
          medio para recibir respuesta, el derecho que deseas ejercer, una descripción clara de los
          datos involucrados y evidencia de identidad. Para rectificación, señala además el cambio
          solicitado y su sustento.
        </p>
        <p>
          Responderemos la solicitud en un máximo de 20 días y, si procede, la haremos efectiva
          dentro de los 15 días siguientes; los plazos pueden ampliarse una vez cuando la ley lo
          permita.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-xl text-pizarron">Cambios al aviso</h2>
        <p>
          Publicaremos cualquier cambio en este apartado y, si es sustancial, mostraremos la nueva
          versión al iniciar sesión para que puedas revisarla. Versión {PRIVACY_NOTICE_VERSION},
          última actualización: {PRIVACY_NOTICE_UPDATED_AT}.
        </p>
      </section>
    </div>
  );
}
