import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createSessionCookie } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Faltan credenciales" }, { status: 400 });
        }

        // Buscar usuario
        const user = await prisma.user.findUnique({
            where: { email },
            include: { territory: true, branch: true } // Incluir relaciones si sirven
        });

        if (!user) {
            // Simular tiempo para evitar timing attacks
            await bcrypt.compare("fake", "$2a$10$fakehashfakehashfakehashfakehashfakehash");
            return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
        }

        // Verificar Contraseña
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
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

        // Retornar Snapshot seguro (sin password)
        return NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                territory: user.territory?.name || "Nacional",

                // Permisos calculados segun rol (importar desde permissions.ts idealmente)
                // Por ahora enviamos vacio o calculado en FE
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
