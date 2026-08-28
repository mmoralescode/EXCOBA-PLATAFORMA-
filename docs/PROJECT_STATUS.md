# Estado del proyecto

## Completado
- **Módulo 1**: Diseño técnico final (arquitectura, modelo de datos,
  flujos críticos, plan de seguridad y pruebas, roadmap).
- **Módulo 2**: Inicialización (Next.js + TypeScript + Tailwind,
  estructura, README, `.env.example`, ESLint/Prettier).
- **Módulo 3**: `prisma/schema.prisma` completo (usuarios, roles,
  licencias, contenido académico, intentos, progreso, auditoría,
  monetización) + `prisma/seed.ts` (roles, admin demo, materias de la
  guía, producto, pregunta de ejemplo por materia).
- **Módulo 4**: Autenticación (registro atado a licencia, login,
  logout, recuperación de contraseña), Argon2id, sesión única
  server-side, middleware de rutas protegidas y cabeceras de
  seguridad base.
- **Módulo 5**: Licencias y folios — generación (`createLicense`),
  validación previa al registro (`validateLicenseFolio`) sin revelar
  la causa del rechazo, endpoints de activación y alta admin.
- **Módulo 6**: Gestión académica — CRUD de materias/temas/lecciones/
  preguntas (rol EDITOR_ACADEMICO), lectura de currícula publicada
  para el alumno sin exponer `isCorrect`.
- **Módulo 7**: Práctica — selección aleatoria de preguntas, entrega
  con calificación 100% server-side, actualización de `progress` y
  algoritmo de priorización por reglas medibles (sin IA).
- **Módulo 8**: Simulador — cronómetro server-authoritative, autosave
  por pregunta, recuperación de estado ante desconexión,
  auto-expiración por tiempo, resultados por materia (`exam_results`).
- **Módulo 9**: Panel administrativo — layout con guardia de rol,
  resumen de métricas, listado de licencias.
- **Módulo 10**: Auditoría reutilizable (`logAudit`), rate limiting ya
  integrado en endpoints sensibles desde módulos previos, pruebas
  unitarias (hashing de contraseñas, tokens/folios, rate limiter).
- **Módulo 11**: README completo (instalación, Docker, despliegue,
  dominio/HTTPS, respaldo, monitoreo, checklists), `docker-compose.yml`
  y `Dockerfile` opcionales.

## En progreso
- Ninguno — los 11 módulos definidos en la especificación quedaron
  cubiertos con código funcional.

## Pendiente (fuera del alcance funcional entregado; siguientes pasos naturales)
- Formularios de UI para login/registro/activación de folio y las
  pantallas de práctica/simulador (hoy los endpoints están completos y
  probables desde cualquier cliente HTTP; falta la interfaz visual
  completa de alumno más allá de `/estudio`).
- Integración real de un proveedor de correo transaccional (hoy
  `sendEmail` registra en consola fuera de producción; ver
  `src/lib/email/mailer.ts`).
- Fase 4 (pagos, generación automática de licencias, cupones) — el
  modelo de datos (`Payment`, `Coupon`) ya existe, la lógica de negocio
  no.
- Pruebas de integración end-to-end contra PostgreSQL real (folio →
  registro → práctica → simulador) con Playwright/Vitest + Testcontainers.
- Repetición espaciada, rachas, logros, PWA (Fase 5).

## Archivos creados o modificados (acumulado)
Ver el árbol completo del proyecto entregado en el zip final. Resumen
por área: configuración raíz (`package.json`, `tsconfig.json`,
`next.config.ts`, Tailwind/PostCSS/ESLint/Prettier, `.env.example`,
`Dockerfile`, `docker-compose.yml`); `prisma/` (schema + seed);
`src/db/`, `src/lib/` (seguridad, sesión, autorización, email,
auditoría), `src/server/use-cases/` (un archivo por caso de uso);
`src/app/api/` (endpoints REST por módulo); `src/app/(alumno)/` y
`src/app/(admin)/` (páginas server-rendered); `tests/`.

## Decisiones técnicas tomadas
- Next.js 14 (App Router) + TypeScript estricto + PostgreSQL + Prisma
  + Zod + Tailwind + Argon2id, monolito modular (ver Módulo 1).
- Sesión server-side revocable en `sessions`, una sesión activa por
  usuario (login nuevo revoca la anterior).
- Folios y tokens sensibles almacenados sólo como hash SHA-256;
  respuestas de validación siempre genéricas para evitar enumeración.
- Calificación de intentos (práctica y simulador) siempre en el
  servidor, comparando contra `Answer.isCorrect`; el cliente nunca
  recibe esa columna.
- Algoritmo de prioridad de estudio basado en fórmula explícita y
  configurable (pesos/umbrales documentados en
  `src/server/use-cases/study-priority.ts`), sin IA.
- Rate limiting en memoria como backend inicial (ver nota de migración
  a Redis en `src/lib/security/rate-limit.ts` si se escala a más de
  una instancia).

## Comandos ejecutados o requeridos
No se ejecutó `npm install` ni migraciones reales en este entorno (no
hay PostgreSQL disponible aquí). Para poner en marcha el proyecto
completo en tu máquina:

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate:dev
npm run db:seed
npm run dev
```

O, con Docker: `docker compose up --build`.

## Próximo módulo
Ninguno pendiente de la lista original. Los "próximos pasos naturales"
quedan listados arriba para cuando quieras continuar el proyecto.
