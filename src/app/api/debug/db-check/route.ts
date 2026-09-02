import { NextResponse } from "next/server";
import { db } from "@/db/client";

/**
 * TEMPORAL — sólo para diagnóstico de despliegue. No expone datos
 * sensibles (sólo conteos), pero de todas formas se debe eliminar una vez
 * confirmada la conectividad en producción.
 */
export async function GET() {
  try {
    const [userCount, licenseCount, roleCount] = await Promise.all([
      db.user.count(),
      db.license.count(),
      db.role.count(),
    ]);
    return NextResponse.json({
      dbConnected: true,
      userCount,
      licenseCount,
      roleCount,
    });
  } catch (error) {
    return NextResponse.json(
      {
        dbConnected: false,
        errorName: error instanceof Error ? error.name : "unknown",
        errorMessage: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
