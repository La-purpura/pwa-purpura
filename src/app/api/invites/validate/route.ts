import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashInviteToken } from "@/lib/invites";
import { handleApiError, applySecurityHeaders } from "@/lib/guard";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/invites/validate?token=...
 * Valida un token de invitación y devuelve la metadata necesaria para la pantalla de activación.
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get("token");

        if (!token) {
            return applySecurityHeaders(
                NextResponse.json({ error: "Token requerido" }, { status: 400 }),
                { noStore: true }
            );
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
            return applySecurityHeaders(
                NextResponse.json({ error: "Invitación no encontrada" }, { status: 404 }),
                { noStore: true }
            );
        }

        // Verificar validez
        if (invitation.revokedAt) {
            return applySecurityHeaders(
                NextResponse.json({ error: "Invitación revocada", code: "REVOKED" }, { status: 400 }),
                { noStore: true }
            );
        }
        if (invitation.usedAt) {
            return applySecurityHeaders(
                NextResponse.json({ error: "Enlace ya utilizado", code: "USED" }, { status: 400 }),
                { noStore: true }
            );
        }
        if (invitation.expiresAt < new Date()) {
            return applySecurityHeaders(
                NextResponse.json({ error: "Enlace expirado", code: "EXPIRED" }, { status: 400 }),
                { noStore: true }
            );
        }

        const response = NextResponse.json({
            valid: true,
            email: invitation.email,
            firstName: invitation.firstName,
            lastName: invitation.lastName,
            role: invitation.role
        });

        return applySecurityHeaders(response, { noStore: true });

    } catch (error) {
        return handleApiError(error);
    }
}
