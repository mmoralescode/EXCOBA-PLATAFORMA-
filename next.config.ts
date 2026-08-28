import type { NextConfig } from "next";

/**
 * Configuración de Next.js para la plataforma EXCOBA.
 *
 * Nota de seguridad: `poweredByHeader` se desactiva para no anunciar
 * la tecnología del servidor. Las cabeceras de seguridad adicionales
 * (CSP, X-Frame-Options, etc.) se agregan en el Módulo 10
 * (Seguridad, rate limiting, auditoría y pruebas), donde se centraliza
 * el middleware de seguridad junto con el rate limiter.
 */
const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "1mb",
    },
  },
};

export default nextConfig;
