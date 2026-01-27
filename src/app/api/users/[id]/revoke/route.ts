import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, enforceScope, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/users/:id/revoke
 * Revoca el acceso de un usuario: cambia estado a REVOKED e invalida todas sus sesiones.
 */
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requirePermission('users:revoke');
        const { id } = params;

        const scopeFilter = await enforceScope(session);

        // 1. Verificar existencia y alcance
        const targetUser = await prisma.user.findFirst({
            where: { id, ...scopeFilter }
        });

        if (!targetUser) {
            return NextResponse.json({ error: "Usuario no encontrado o fuera de alcance" }, { status: 404 });
        }

        if (id === session.sub) {
            return NextResponse.json({ error: "No puedes revocarte a ti mismo" }, { status: 400 });
        }

        // 2. Transacción para asegurar consistencia
        await prisma.$transaction([
            // Cambiar estado a REVOKED
            prisma.user.update({
                where: { id },
                data: { status: 'REVOKED' }
            }),
            // Eliminar todas las sesiones activas del usuario
            prisma.session.deleteMany({
                where: { userId: id }
            })
        ]);

        // 3. Auditar
        logAudit("USER_REVOKED", "User", id, session.sub);

        return NextResponse.json({ success: true, message: "Acceso revocado correctamente" });

    } catch (error) {
        return handleApiError(error);
    }
}
