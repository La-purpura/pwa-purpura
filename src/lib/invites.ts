import crypto from "crypto";

/**
 * Genera un token aleatorio y seguro para invitaciones.
 */
export function generateInviteToken(): string {
    return crypto.randomBytes(32).toString("hex");
}

/**
 * Genera un hash del token para guardar en la base de datos.
 * Evita guardar el token plano en caso de filtración de DB.
 */
export function hashInviteToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
}
