import { NextResponse } from "next/server";
import { ROLE_PERMISSIONS, ROLE_LABELS } from "@/lib/rbac";
import { requirePermission, handleApiError } from "@/lib/guard";

export const dynamic = 'force-dynamic';

/**
 * GET /api/roles
 * Devuelve la lista de roles definidos en el sistema y sus permisos asociados.
 * Solo accesible para usuarios con permiso de gestión de roles o invitación.
 */
export async function GET() {
    try {
        await requirePermission('users:invite');

        const roles = Object.entries(ROLE_PERMISSIONS).map(([code, permissions]) => ({
            code,
            label: ROLE_LABELS[code as keyof typeof ROLE_LABELS] || code,
            permissions
        }));

        return NextResponse.json(roles);
    } catch (error) {
        return handleApiError(error);
    }
}
