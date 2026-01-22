import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

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
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            // Log failed login attempt? Maybe later to avoid spam, but critical for security
            return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
        }

        // Verificar Estado
        if (user.status !== "ACTIVE") {
            return NextResponse.json({ error: "Cuenta suspendida o inactiva" }, { status: 403 });
        }

        // Crear Sesión
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
                name: user.name,
                email: user.email,
                role: user.role,
                territory: user.territory?.name || "Global",
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
