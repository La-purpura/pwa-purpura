import { getSession } from "@/lib/auth";
import { Permission, ROLE_PERMISSIONS, Role } from "@/lib/permissions";
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
    // Si es SuperAdmin, a veces tiene wildcard, pero aquí usamos lista explícita
    if (!userRole || !ROLE_PERMISSIONS[userRole]) {
        // Fallback seguro
        throw new PermissionError("Rol de usuario inválido o sin esquema de permisos");
    }

    const hasPerm = ROLE_PERMISSIONS[userRole].includes(permission);
    if (!hasPerm) {
        throw new PermissionError(`Acceso denegado: Requieres permiso '${permission}'`);
    }

    return session;
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
