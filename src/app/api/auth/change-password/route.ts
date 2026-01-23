import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { verifySession } from "@/lib/auth";
import { cookies } from "next/headers";
import { logAudit } from "@/lib/audit";

export async function POST(request: Request) {
    try {
        const token = cookies().get("session")?.value;
        const sessionPayload = token ? await verifySession(token) : null;

        if (!sessionPayload) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const body = await request.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: sessionPayload.sub }
        });

        if (!user) {
            return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) {
            return NextResponse.json({ error: "La contraseña actual es incorrecta" }, { status: 400 });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: hashedNewPassword }
        });

        logAudit("PASSWORD_CHANGED", "User", user.id, user.id);

        return NextResponse.json({ success: true, message: "Contraseña actualizada" });
    } catch (error) {
        console.error("Change Password Error:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
