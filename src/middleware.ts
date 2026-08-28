import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware de plataforma:
 * 1. Agrega cabeceras de seguridad básicas a toda respuesta.
 * 2. Redirige a /login si no hay cookie de sesión en rutas protegidas.
 *
 * La verificación aquí es sólo de "¿existe una cookie con forma válida?"
 * (Edge Runtime no puede consultar PostgreSQL directamente). La validación
 * fuerte —sesión no revocada, no expirada, rol correcto— ocurre siempre en
 * el servidor dentro de cada Route Handler/Server Component vía
 * `requireUser`/`requireRole` (ver `src/lib/authorization.ts`). El
 * middleware es una primera barrera de UX, no la fuente de autorización.
 */
const PROTECTED_PREFIXES = ["/estudio", "/practica", "/simulador", "/perfil", "/admin"];
const SESSION_COOKIE_NAME = "excoba_session";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self';",
  );

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix),
  );

  if (isProtected) {
    const hasSessionCookie = request.cookies.has(SESSION_COOKIE_NAME);
    if (!hasSessionCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
