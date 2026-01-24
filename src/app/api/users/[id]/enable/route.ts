import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

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
