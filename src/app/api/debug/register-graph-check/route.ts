import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/client";
import { hashPassword } from "@/lib/security/password";

/**
 * TEMPORAL — replica el mismo grafo de imports que
 * src/server/use-cases/register-user.ts (db + zod + argon2 vía
 * hashPassword) para confirmar que el fix de serverComponentsExternalPackages
 * resuelve el problema en ESTE contexto de empaquetado específico, sin
 * escribir nada en la base de datos.
 */
const _schema = z.object({ probe: z.string().optional() });

export async function GET() {
  try {
    await db.role.count(); // toca Prisma, igual que register-user.ts
    const hash = await hashPassword("prueba-diagnostico-register");
    return NextResponse.json({ works: true, hashPrefix: hash.slice(0, 20) });
  } catch (error) {
    return NextResponse.json(
      { works: false, errorMessage: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
