import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireAuth, handleApiError, applySecurityHeaders } from "@/lib/guard";
import { logAudit } from "@/lib/audit";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const ChangePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres")
});

export async function POST(request: Request) {
    try {
        const session = await requireAuth();

        // Rate Limit per IP and per User ID (combined)
        const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
        const limiter = rateLimit(`cp-${session.sub}-${ip}`, { limit: 3, windowMs: 10 * 60 * 1000 }); // 3 attempts per 10 mins

        if (!limiter.success) {
            return applySecurityHeaders(
                NextResponse.json({ error: "Demasiados intentos. Por favor espere 10 minutos." }, { status: 429 }),
                { noStore: true }
            );
        }

        const body = await request.json();
        const result = ChangePasswordSchema.safeParse(body);

        if (!result.success) {
            return handleApiError(result.error);
        }

        const { currentPassword, newPassword } = result.data;

        const user = await prisma.user.findUnique({
            where: { id: session.sub }
        });

        if (!user) {
            return applySecurityHeaders(
                NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 }),
                { noStore: true }
            );
        }

        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) {
            return applySecurityHeaders(
                NextResponse.json({ error: "La contraseña actual es incorrecta" }, { status: 400 }),
                { noStore: true }
            );
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 12);

        await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: hashedNewPassword }
        });

        logAudit("PASSWORD_CHANGED", "User", user.id, user.id, { ip });

        const response = NextResponse.json({ success: true, message: "Contraseña actualizada" });
        return applySecurityHeaders(response, { noStore: true });

    } catch (error) {
        return handleApiError(error);
    }
}
