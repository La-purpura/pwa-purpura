import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { hashInviteToken } from "@/lib/invites";
import { createSessionCookie } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

/**
 * POST /api/invites/consume
 * Consume la invitación, crea el usuario (o activa uno pendiente) y establece su contraseña.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { token, password, confirmPassword } = body;

        if (!token || !password || !confirmPassword) {
            return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
        }

        if (password !== confirmPassword) {
            return NextResponse.json({ error: "Las contraseñas no coinciden" }, { status: 400 });
        }

        // 1. Buscar invitación
        const tokenHash = hashInviteToken(token);
        const invitation = await prisma.invitation.findUnique({
            where: { tokenHash }
        });

        if (!invitation || invitation.revokedAt || invitation.usedAt || invitation.expiresAt < new Date()) {
            return NextResponse.json({ error: "Invitación inválida o expirada" }, { status: 400 });
        }

        // 2. Cifrar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Crear o actualizar usuario
        const fullName = `${invitation.firstName || ""} ${invitation.lastName || ""}`.trim() || invitation.email.split('@')[0];

        let user = await prisma.user.findUnique({ where: { email: invitation.email } });

        if (user) {
            // Si el usuario existe pero está PENDING (por ejemplo, creado vía seed o admin previo)
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    passwordHash: hashedPassword,
                    status: 'ACTIVE',
                    name: fullName,
                    branchId: invitation.branchId || user.branchId,
                    territoryScope: invitation.territoryScope || user.territoryScope
                }
            });
        } else {
            // Crear usuario nuevo
            user = await prisma.user.create({
                data: {
                    email: invitation.email,
                    name: fullName,
                    passwordHash: hashedPassword,
                    role: invitation.role,
                    status: 'ACTIVE',
                    branchId: invitation.branchId,
                    territoryScope: invitation.territoryScope
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
            invitationId: invitation.id
        });

        // 6. Login Automático (Opcional según requerimiento, pero recomendado para UX)
        await createSessionCookie({
            sub: user.id,
            email: user.email,
            role: user.role,
            territoryId: user.territoryId || undefined,
            branchId: user.branchId || undefined
        });

        return NextResponse.json({
            success: true,
            message: "Cuenta activada correctamente",
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Consume Invite Error:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
