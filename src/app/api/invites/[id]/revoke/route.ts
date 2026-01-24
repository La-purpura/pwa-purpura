import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

/**
 * POST /api/invites/:id/revoke
 * Revoca una invitación existente para que no pueda ser utilizada.
 */
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requirePermission('users:revoke');
        const { id } = params;

        if (!id) {
            return NextResponse.json({ error: "ID de invitación requerido" }, { status: 400 });
        }

        const invitation = await prisma.invitation.findUnique({
            where: { id }
        });

        if (!invitation) {
            return NextResponse.json({ error: "Invitación no encontrada" }, { status: 404 });
        }

        if (invitation.revokedAt) {
            return NextResponse.json({ error: "Invitación ya estaba revocada" }, { status: 400 });
        }

        if (invitation.usedAt) {
            return NextResponse.json({ error: "No se puede revocar una invitación ya utilizada" }, { status: 400 });
        }

        const updated = await prisma.invitation.update({
            where: { id },
            data: { revokedAt: new Date() }
        });

        // Auditar
        logAudit("INVITE_REVOKED", "Invitation", id, session.sub);

        return NextResponse.json({ success: true, message: "Invitación revocada" });

    } catch (error) {
        return handleApiError(error);
    }
}
