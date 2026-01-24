import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

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

        // 1. Evitar auto-revocación accidental (opcional, pero recomendado)
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
