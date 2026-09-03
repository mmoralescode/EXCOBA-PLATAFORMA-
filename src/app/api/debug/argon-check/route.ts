import { NextResponse } from "next/server";
import { hashPassword, verifyPassword } from "@/lib/security/password";

/** TEMPORAL — confirma que argon2 carga en este runtime, luego se elimina. */
export async function GET() {
  try {
    const hash = await hashPassword("prueba-diagnostico");
    const valid = await verifyPassword(hash, "prueba-diagnostico");
    return NextResponse.json({
      argon2Works: true,
      nodeVersion: process.version,
      verifyResult: valid,
    });
  } catch (error) {
    return NextResponse.json(
      {
        argon2Works: false,
        nodeVersion: process.version,
        errorMessage: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
