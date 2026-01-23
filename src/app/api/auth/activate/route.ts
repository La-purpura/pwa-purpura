import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSessionCookie } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { token, password } = body;

        if (!token || !password) {
            return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
        }

        // 1. Buscar invitación válida
        const invitation = await prisma.invitation.findUnique({
            where: { tokenHash: token },
            include: { invitedBy: true }
        });

        if (!invitation || invitation.revokedAt || invitation.usedAt || invitation.expiresAt < new Date()) {
            return NextResponse.json({ error: "Invitación inválida o expirada" }, { status: 400 });
        }

        // 2. Crear usuario si no existe (o actualizar si estaba pendiente)
        const hashedPassword = await bcrypt.hash(password, 10);

        // Verificamos si ya hay un usuario con ese email (podría estar PENDING)
        let user = await prisma.user.findUnique({ where: { email: invitation.email } });

        if (user) {
            if (user.status !== 'PENDING') {
                return NextResponse.json({ error: "Esta cuenta ya está activa" }, { status: 400 });
            }
            // Activar
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    passwordHash: hashedPassword,
                    status: 'ACTIVE',
                    branchId: invitation.branchId,
                    territoryScope: invitation.territoryScope
                }
            });
        } else {
            // Crear
            user = await prisma.user.create({
                data: {
                    email: invitation.email,
                    name: invitation.email.split('@')[0], // Default name
                    passwordHash: hashedPassword,
                    role: invitation.role,
                    status: 'ACTIVE',
                    branchId: invitation.branchId,
                    territoryScope: invitation.territoryScope
                }
            });
        }

        // 3. Marcar invitación como usada
        await prisma.invitation.update({
            where: { id: invitation.id },
            data: { usedAt: new Date() }
        });

        // 4. Iniciar sesión automáticamente
        await createSessionCookie({
            sub: user.id,
            email: user.email,
            role: user.role,
            name: user.name || "",
            territoryId: null // Se puede ajustar si el esquema de territorios cambia
        });

        logAudit("ACCOUNT_ACTIVATED", "User", user.id, user.id);

        return NextResponse.json({ success: true, message: "Cuenta activada correctamente" });

    } catch (error) {
        console.error("Activation Error:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
