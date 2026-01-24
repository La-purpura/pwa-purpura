import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSessionCookie } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const email = body.identifier || body.email;
        const password = body.password;

        if (!email || !password) {
            return NextResponse.json({ error: "Faltan credenciales" }, { status: 400 });
        }

        // Buscar usuario
        const user = await prisma.user.findUnique({
            where: { email },
            include: { territory: true, branch: true }
        });

        if (!user) {
            await bcrypt.compare("fake", "$2a$10$fakehashfakehashfakehashfakehashfakehash");
            return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
        }

        // Verificar Contraseña
        if (!user.passwordHash) {
            return NextResponse.json({ error: "Cuenta mal configurada" }, { status: 500 });
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);

        if (!isValid) {
            return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
        }

        // Verificar Estado
        if (user.status !== "ACTIVE") {
            return NextResponse.json({ error: "Cuenta suspendida o inactiva" }, { status: 403 });
        }

        // Crear Sesión persistente
        await createSessionCookie({
            sub: user.id,
            email: user.email,
            role: user.role,
            territoryId: user.territoryId || undefined,
            branchId: user.branchId || undefined
        });

        // AUDIT LOG: Login Success
        await prisma.auditLog.create({
            data: {
                action: 'LOGIN_SUCCESS',
                entity: 'User',
                entityId: user.id,
                actorId: user.id,
                metadata: JSON.stringify({ email: user.email, role: user.role })
            }
        });

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                status: user.status,
                branchId: user.branchId,
                branch: user.branch?.name || "Sin rama",
                territoryId: user.territoryId,
                territory: user.territory?.name || "Global",
                territoryScope: user.territoryScope,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=random`
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
