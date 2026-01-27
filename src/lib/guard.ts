import { getSession } from "@/lib/auth";
import { Permission, ROLE_PERMISSIONS, Role } from "@/lib/rbac";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { headers } from "next/headers";
import * as Sentry from "@sentry/nextjs";
import { Logger } from "@/lib/logger";

export class AuthError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AuthError";
    }
}

export class PermissionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "PermissionError";
    }
}

export async function requireAuth() {
    const session = await getSession();
    if (!session) {
        throw new AuthError("Usuario no autenticado");
    }
    return session;
}

export async function requirePermission(permission: Permission) {
    const session = await requireAuth();

    const userRole = session.role as Role;
    if (!userRole || !ROLE_PERMISSIONS[userRole]) {
        throw new PermissionError("Rol de usuario inválido o sin esquema de permisos");
    }

    const hasPerm = ROLE_PERMISSIONS[userRole].includes(permission);
    if (!hasPerm) {
        throw new PermissionError(`Acceso denegado: Requieres permiso '${permission}'`);
    }

    return session;
}

/**
 * enforceScope
 * Genera un objeto de filtro para Prisma basado en el alcance territorial y de rama del usuario.
 */
export async function enforceScope(
    session: any,
    options: {
        branch?: boolean,
        territory?: boolean,
        logic?: 'AND' | 'OR',
        isMany?: boolean, // Si usa relación many-to-many (vía tabla secundaria)
        relationName?: string
    } = { branch: true, territory: true, logic: 'AND', isMany: false, relationName: 'territories' }
) {
    if (session.role === 'SuperAdminNacional') return {};

    const { branch = true, territory = true, logic = 'AND', isMany = false, relationName = 'territories' } = options;

    const conditions: any[] = [];

    // 1. Territorios
    if (territory && session.territoryId) {
        if (isMany) {
            conditions.push({
                OR: [
                    { [relationName]: { none: {} } }, // Global
                    { [relationName]: { some: { territoryId: session.territoryId } } } // Su territorio
                ]
            });
        } else {
            conditions.push({
                OR: [
                    { territoryId: null },
                    { territoryId: session.territoryId }
                ]
            });
        }
    }

    // 2. Ramas (Single field usually)
    if (branch && session.branchId) {
        conditions.push({
            OR: [
                { branchId: null },
                { branchId: session.branchId }
            ]
        });
    }

    if (conditions.length === 0) return {};

    return logic === 'AND' ? { AND: conditions } : { OR: conditions };
}

export function handleApiError(error: any) {
    const headersList = headers();
    const requestId = headersList.get("x-request-id") || undefined;
    const path = headersList.get("x-path") || undefined;
    const method = headersList.get("x-method") || "UNKNOWN"; // x-method not set in middleware yet, but logic is sound

    // Common metadata
    const meta = { requestId, path, method };

    if (error instanceof AuthError) {
        Logger.warn(error.message, { ...meta, statusCode: 401 });
        return NextResponse.json({ error: error.message }, {
            status: 401,
            headers: { 'Cache-Control': 'no-store' }
        });
    }
    if (error instanceof PermissionError) {
        Logger.warn(error.message, { ...meta, statusCode: 403 });
        return NextResponse.json({ error: error.message }, {
            status: 403,
            headers: { 'Cache-Control': 'no-store' }
        });
    }
    if (error instanceof ZodError) {
        Logger.warn("Validación fallida", { ...meta, statusCode: 400, details: error.flatten() });
        return NextResponse.json({
            error: "Datos de entrada inválidos",
            details: error.issues.map(e => ({ path: e.path, message: e.message }))
        }, { status: 400 });
    }

    // Unhandled 500
    Logger.error("Error interno del servidor", { ...meta, statusCode: 500, error });

    // Sentry Capture
    Sentry.captureException(error, {
        extra: { requestId, path }
    });

    return NextResponse.json({ error: "Error interno del servidor", requestId }, { status: 500 });
}

/**
 * applySecurityHeaders
 * Agrega headers de seguridad y Cache-Control a la respuesta.
 */
export function applySecurityHeaders(res: NextResponse, options: { noStore?: boolean } = {}) {
    res.headers.set('X-Frame-Options', 'DENY');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    if (options.noStore) {
        res.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    }

    return res;
}
