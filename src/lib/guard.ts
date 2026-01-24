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
    if (error instanceof AuthError) {
        return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof PermissionError) {
        return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error("Unhandled API Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
}
