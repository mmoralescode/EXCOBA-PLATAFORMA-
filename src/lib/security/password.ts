import argon2 from "argon2";

/**
 * Hashing de contraseñas con Argon2id (recomendado sobre bcrypt por su
 * resistencia a ataques con GPU/ASIC). Ver decisión técnica en Módulo 1,
 * sección 4.
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return argon2.hash(plainPassword, { type: argon2.argon2id });
}

export async function verifyPassword(
  passwordHash: string,
  plainPassword: string,
): Promise<boolean> {
  try {
    return await argon2.verify(passwordHash, plainPassword);
  } catch {
    // Un hash corrupto o con formato inesperado nunca debe lanzar hacia
    // arriba; se trata como contraseña incorrecta.
    return false;
  }
}
