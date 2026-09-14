# Buzón de sugerencias y errores

En **Perfil**, debajo del código de recuperación, el alumno puede elegir sugerencia o error, indicar la sección y describirlo (10–1000 caracteres). Se muestra confirmación solamente después de que el servidor confirme la recepción. Ante un error se conserva el texto en memoria para reintentar; no se almacena en el navegador ni se incorpora a URLs.

Los mensajes quedan vinculados a la cuenta y solo los roles **SUPER_ADMIN** y **SOPORTE** pueden consultarlos en **Panel administrativo → Buzón** (`/admin/feedback`). La bandeja tiene paginación de 20 mensajes y permite marcar revisado o devolver a pendiente. «Revisado» indica que fue leído, no que el error esté resuelto. No se envían correos ni notificaciones automáticas y no se incorpora un chat.

### Acceso al panel y envío desde Perfil

Para enviar un reporte se utiliza `/perfil#buzon`, no `/admin/feedback`. Las cuentas sin rol administrativo reciben una pantalla «Acceso restringido» con enlace al buzón de Perfil, conservando su sesión. Las sesiones ausentes o vencidas se redirigen a iniciar sesión. No se asignan roles automáticamente por ser propietario del repositorio, por dirección de correo o por visitar un enlace.

Corrección del 14 de septiembre de 2026: los registros de producción correlacionaron el digest `366273504` en `/admin/feedback` con un `ForbiddenError` no gestionado. Ahora las páginas y el layout distinguen denegación esperada de errores inesperados. Cada página administrativa autoriza antes de consultar datos, independientemente del layout (pueden renderizar en paralelo). El aviso HTML no implica autorización ni un HTTP 403: las APIs mantienen sus respuestas 401/403; ninguna consulta de mensajes se realiza para un rol denegado. La prueba anterior que aceptaba lanzar una excepción se sustituyó por comprobaciones del aviso y de ausencia de consultas.

## Seguridad

- Las rutas y APIs siguen protegidas por sesión y autorización del servidor; no se añaden excepciones públicas.
- Los mensajes son texto escapado por React, no HTML ni enlaces ejecutables. No se admiten adjuntos.
- El formulario advierte no incluir contraseñas, folios, códigos de recuperación o datos sensibles. No es un buzón anónimo.
- El servidor asigna la identidad; rechaza campos adicionales, tipos, secciones, UUID y longitudes inválidas. Límite HTTP de 4 KiB, JSON y comprobación de origen; respuestas privadas sin caché.
- Un identificador de envío único por usuario evita duplicados al reintentar después de una respuesta perdida. Se rechaza reutilizarlo para otro contenido.
- Máximo de 5 mensajes nuevos por cuenta en una ventana móvil de una hora: verificación persistente en PostgreSQL dentro de la transacción, bajo bloqueo por usuario. Un reintento idéntico no consume la cuota.
- Contadores adicionales de intentos por proceso (10/15 minutos para enviar, 120/15 minutos para revisión) no son un limitador distribuido. La cuota de mensajes sí es persistente.
- Se registra auditoría de envío/cambio de revisión, sin copiar el mensaje ni secretos a logs. No se alteran licencias, sesiones, recuperación, roles ni avance.

## Archivos y migración

- `src/components/feedback-box.tsx` y `src/app/(alumno)/perfil/page.tsx`: envío del alumno.
- `src/app/(admin)/admin/feedback/page.tsx`, `src/components/feedback-review-button.tsx` y layout administrativo: consulta y revisión privada.
- `src/app/api/feedback/route.ts`, `src/app/api/admin/feedback/[id]/route.ts`, `src/server/use-cases/feedback.ts`: validaciones, guardado, permisos y auditoría.
- `src/components/privacy-notice-content.tsx`: descripción del buzón opcional. Se mantiene la finalidad de soporte y no se reinician aceptaciones previas.
- `prisma/schema.prisma` y migración `20260914100000_add_feedback_inbox`: tabla `Feedback`, enums de tipo/sección e índices. No modifica filas existentes. Se aplica con el comando `prisma migrate deploy` ya configurado en Vercel.
- Pruebas en `tests/feedback*.test.*` y regresión de acceso en `tests/access-gating.test.ts`. Las pruebas UI usan renderizado y manejadores simulados; no equivalen a una revisión en navegador real.
