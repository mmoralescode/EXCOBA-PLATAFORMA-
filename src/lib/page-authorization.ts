import type { RoleName } from "@prisma/client";
import { redirect } from "next/navigation";
import { ForbiddenError, requireRole, UnauthorizedError } from "@/lib/authorization";

/** Page-only handling. APIs keep requireRole's explicit 401/403 error contract. */
export async function requirePageRole(...allowed: RoleName[]) {
  try {
    return await requireRole(...allowed);
  } catch (error) {
    if (error instanceof UnauthorizedError) redirect("/login");
    if (error instanceof ForbiddenError) return null;
    // Preserve unexpected errors and Next.js redirect/dynamic-render control flow.
    throw error;
  }
}
