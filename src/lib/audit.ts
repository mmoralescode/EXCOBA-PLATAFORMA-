import { db } from "@/db/client";

/**
 * Registra una acción sensible en `audit_logs`. Se usa desde los casos de
 * uso/endpoints que ya invocan `requireRole`/`requireUser`, para no repetir
 * la construcción del objeto en cada endpoint (ver Módulo 1, sección 11).
 */
export async function logAudit(params: {
  actorId: string | null;
  action: string;
  entity: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}) {
  await db.auditLog.create({
    data: {
      actorId: params.actorId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      metadata: params.metadata,
    },
  });
}
