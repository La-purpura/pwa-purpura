import { getSession } from "@/lib/auth";
import { Permission, ROLE_PERMISSIONS, Role } from "@/lib/rbac";
import { NextResponse } from "next/server";

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
 * @param session Sesión activa
 * @param entityScope Propiedades de la entidad a considerar (territoryId, branchId)
 * @param logic 'AND' (estricto) o 'OR' (visible si coincide territorio O rama O es global)
 */
export async function enforceScope(
    session: any,
    options: { branch?: boolean, territory?: boolean, logic?: 'AND' | 'OR' } = { branch: true, territory: true, logic: 'AND' }
) {
    if (session.role === 'SuperAdminNacional') return {};

    const { branch = true, territory = true, logic = 'AND' } = options;

    if (logic === 'OR') {
        const orConditions: any[] = [{ territoryId: null, branchId: null }];
        if (territory && session.territoryId) orConditions.push({ territoryId: session.territoryId });
        if (branch && session.branchId) orConditions.push({ branchId: session.branchId });
        return { OR: orConditions };
    }

    const filters: any = {};
    if (branch && session.branchId) filters.branchId = session.branchId;
    if (territory && session.territoryId) filters.territoryId = session.territoryId;

    return filters;
}

export function handleApiError(error: any) {
    if (error instanceof AuthError) {
        return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof PermissionError) {
        return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error("Unhandled API Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
}
