import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { hashInviteToken } from "@/lib/invites";
import { createSessionCookie } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { z } from "zod";
import { handleApiError, applySecurityHeaders } from "@/lib/guard";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const ConsumeSchema = z.object({
    token: z.string().min(10),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"]
});

export async function POST(request: Request) {
    try {
        const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
        const limiter = rateLimit(ip, { limit: 10, windowMs: 15 * 60 * 1000 }); // 10 attempts per 15 mins

        if (!limiter.success) {
            return applySecurityHeaders(
                NextResponse.json({ error: "Demasiados intentos. Por favor espere 15 minutos." }, { status: 429 }),
                { noStore: true }
            );
        }

        const body = await request.json();
        const result = ConsumeSchema.safeParse(body);

        if (!result.success) {
            return handleApiError(result.error);
        }

        const { token, password } = result.data;

        // 1. Buscar invitación
        const tokenHash = hashInviteToken(token);
        const invitation = await prisma.invitation.findUnique({
            where: { tokenHash }
        });

        if (!invitation || invitation.revokedAt || invitation.usedAt || (invitation.expiresAt && invitation.expiresAt < new Date())) {
            return applySecurityHeaders(
                NextResponse.json({ error: "Invitación inválida o expirada" }, { status: 400 }),
                { noStore: true }
            );
        }

        // 2. Cifrar contraseña
        const hashedPassword = await bcrypt.hash(password, 12); // Slightly higher cost for protection

        // 3. Crear o actualizar usuario
        const fullName = `${invitation.firstName || ""} ${invitation.lastName || ""}`.trim() || invitation.email.split('@')[0];

        let user = await prisma.user.findUnique({ where: { email: invitation.email } });

        if (user) {
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    passwordHash: hashedPassword,
                    status: 'ACTIVE',
                    name: fullName,
                    branchId: invitation.branchId || user.branchId,
                    territoryScope: (invitation.territoryScope as any) || (user.territoryScope as any)
                }
            });
        } else {
            user = await prisma.user.create({
                data: {
                    email: invitation.email,
                    name: fullName,
                    passwordHash: hashedPassword,
                    role: invitation.role,
                    status: 'ACTIVE',
                    branchId: invitation.branchId,
                    territoryScope: invitation.territoryScope as any
                }
            });
        }

        // 4. Marcar invitación como usada
        await prisma.invitation.update({
            where: { id: invitation.id },
            data: { usedAt: new Date() }
        });

        // 5. Auditar
        logAudit("INVITE_ACCEPTED", "User", user.id, user.id, {
            invitationId: invitation.id,
            ip
        });

        // 6. Login Automático
        await createSessionCookie({
            sub: user.id,
            email: user.email,
            role: user.role,
            territoryId: user.territoryId || undefined,
            branchId: user.branchId || undefined
        });

        const response = NextResponse.json({
            success: true,
            message: "Cuenta activada correctamente",
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });

        return applySecurityHeaders(response, { noStore: true });

    } catch (error) {
        return handleApiError(error);
    }
}
