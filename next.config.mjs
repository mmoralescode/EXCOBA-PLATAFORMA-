/**
 * Configuración de Next.js para la plataforma EXCOBA.
 *
 * Nota: se usa .mjs (no .ts) porque Next.js 14.x no soporta
 * `next.config.ts` — ese soporte se agregó hasta Next.js 15. Si en el
 * futuro se actualiza el proyecto a Next.js 15+, este archivo puede
 * volver a convertirse a next.config.ts si se prefiere.
 *
 * Nota de seguridad: `poweredByHeader` se desactiva para no anunciar
 * la tecnología del servidor. Las cabeceras de seguridad adicionales
 * (CSP, X-Frame-Options, etc.) se agregan en el middleware
 * (ver src/middleware.ts, Módulo 10).
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "1mb",
    },
    // argon2 tiene un binario nativo (.node) compilado por plataforma.
    // Sin esto, el empaquetado/tracing automático de Next.js para
    // Route Handlers a veces no incluye ese binario en el bundle de la
    // función serverless (falla intermitente por ruta: algunas rutas
    // que importan argon2 sí lo encuentran en runtime, otras no, según
    // cómo el analizador estático siguió el grafo de imports). Esto le
    // dice a Next.js que deje `argon2` como un require() externo real en
    // vez de intentar empaquetarlo, para que el tracing de archivos de
    // Vercel copie el paquete completo (incluidos los binarios
    // precompilados) tal como está en node_modules.
    serverComponentsExternalPackages: ["argon2"],
  },
};

export default nextConfig;
