import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashInviteToken } from "@/lib/invites";

export const dynamic = 'force-dynamic';

/**
 * GET /api/invites/validate?token=...
 * Valida un token de invitación y devuelve la metadata necesaria para la pantalla de activación.
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.json({ error: "Token requerido" }, { status: 400 });
        }

        const tokenHash = hashInviteToken(token);

        const invitation = await prisma.invitation.findUnique({
            where: { tokenHash },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                expiresAt: true,
                usedAt: true,
                revokedAt: true
            }
        });

        if (!invitation) {
            return NextResponse.json({ error: "Invitación no encontrada" }, { status: 404 });
        }

        // Verificar validez
        if (invitation.revokedAt) {
            return NextResponse.json({ error: "Invitación revocada", code: "REVOKED" }, { status: 400 });
        }
        if (invitation.usedAt) {
            return NextResponse.json({ error: "Enlace ya utilizado", code: "USED" }, { status: 400 });
        }
        if (invitation.expiresAt < new Date()) {
            return NextResponse.json({ error: "Enlace expirado", code: "EXPIRED" }, { status: 400 });
        }

        return NextResponse.json({
            valid: true,
            email: invitation.email,
            firstName: invitation.firstName,
            lastName: invitation.lastName,
            role: invitation.role
        });

    } catch (error) {
        console.error("Invite validation error:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
