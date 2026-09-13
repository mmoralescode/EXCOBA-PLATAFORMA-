# Simulador ampliado

- 60 preguntas por intento y 60 minutos; intentos anteriores conservan su configuración.
- Banco: 118 preguntas anteriores + 40 originales nuevas en `src/content/simulator-expansion.json` (14 de Matemáticas, 13 de Física y 13 de Química).
- Cada pregunta nueva referencia un apartado real del temario. `demoId` vacío indica que no se atribuye a un reactivo del demo oficial.
- Arrastre de una opción a un recuadro mediante eventos de puntero (ratón, pantalla táctil o lápiz). Alternativa con toque, clic o Tab + Enter/Espacio. Permite reemplazar y quitar la elección.
- Esta entrega mantiene preguntas de respuesta única y calificación existente. No implementa clasificación múltiple, ubicación en imágenes ni crédito parcial del examen oficial.
- Una pregunta por pantalla, navegación libre, conteo de respondidas y autoguardado serializado. Al entregar se espera a las escrituras pendientes. La API comprueba usuario, pertenencia del reactivo y opción, y califica en el servidor.
- Formulario plegable con fórmulas, condiciones y unidades; no importa el banco de preguntas ni revela respuestas. Consultarlo no pausa el tiempo.
- No se requiere migración Prisma. La importación existente agrega IDs nuevos de forma idempotente, sin modificar preguntas o respuestas anteriores, folios ni usuarios.

## Referencia

El [instructivo oficial UAQ 2026-2](https://dsa.uaq.mx/convocatorias/Convocatoria-2026/Instructivo_EXCOBA-UAQ-Licenciatura_2026-2.pdf), páginas impresas 2–3, describe arrastre de elementos, selección y escritura; además menciona el formulario del demo. Esta plataforma implementa un apoyo propio, no una reproducción exacta del demo o del examen.

## Comprobación

Ejecutar `npm test`, `npm run typecheck` y `npm run build`. Probar arrastrar al recuadro, soltar fuera, cambiar/quitar selección, responder con teclado y pantalla táctil, navegar/recargar, abrir formulario y entregar. El formulario y simulador siguen dentro del área autenticada.
