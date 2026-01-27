import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, enforceScope, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/users/:id/enable
 * Restaura el acceso a un usuario previamente revocado o pendiente.
 */
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requirePermission('users:edit');
        const { id } = params;

        const scopeFilter = await enforceScope(session);

        // 1. Verificar existencia y alcance
        const targetUser = await prisma.user.findFirst({
            where: { id, ...scopeFilter }
        });

        if (!targetUser) {
            return NextResponse.json({ error: "Usuario no encontrado o fuera de alcance" }, { status: 404 });
        }

        await prisma.user.update({
            where: { id },
            data: { status: 'ACTIVE' }
        });

        // Auditar
        logAudit("USER_ENABLED", "User", id, session.sub);

        return NextResponse.json({ success: true, message: "Acceso habilitado correctamente" });

    } catch (error) {
        return handleApiError(error);
    }
}
