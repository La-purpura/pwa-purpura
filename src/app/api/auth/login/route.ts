import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSessionCookie } from "@/lib/auth";
import { z } from "zod";
import { handleApiError, applySecurityHeaders } from "@/lib/guard";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const LoginSchema = z.object({
    identifier: z.string().email().optional(),
    email: z.string().email().optional(),
    password: z.string().min(6)
}).refine(data => data.identifier || data.email, {
    message: "Debe proporcionar un email",
    path: ["identifier"]
});

export async function POST(request: Request) {
    try {
        // 1. Rate Limiting (Brute Force Protection)
        const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
        const limiter = rateLimit(ip, { limit: 5, windowMs: 60 * 1000 }); // 5 attempts per minute

        if (!limiter.success) {
            return applySecurityHeaders(
                NextResponse.json({ error: "Demasiados intentos. Reintente en un minuto." }, { status: 429 }),
                { noStore: true }
            );
        }

        // 2. Input Validation
        const body = await request.json();
        const result = LoginSchema.safeParse(body);

        if (!result.success) {
            return handleApiError(result.error);
        }

        const email = (result.data.identifier || result.data.email) as string;
        const password = result.data.password;

        // 3. User Lookup
        const user = await prisma.user.findUnique({
            where: { email },
            include: { territory: true, branch: true }
        });

        // Constant time comparison placeholder if user not found
        if (!user) {
            await bcrypt.compare("fake", "$2a$10$fakehashfakehashfakehashfakehashfakehash");
            return applySecurityHeaders(
                NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 }),
                { noStore: true }
            );
        }

        // 4. Verify Password
        if (!user.passwordHash) {
            return NextResponse.json({ error: "Cuenta mal configurada" }, { status: 500 });
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);

        if (!isValid) {
            return applySecurityHeaders(
                NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 }),
                { noStore: true }
            );
        }

        // 5. Check Status
        if (user.status !== "ACTIVE") {
            return applySecurityHeaders(
                NextResponse.json({ error: "Cuenta suspendida o inactiva" }, { status: 403 }),
                { noStore: true }
            );
        }

        // 6. Create Session
        await createSessionCookie({
            sub: user.id,
            email: user.email,
            role: user.role,
            territoryId: user.territoryId || undefined,
            branchId: user.branchId || undefined
        });

        // 7. Audit Log
        await prisma.auditLog.create({
            data: {
                action: 'LOGIN_SUCCESS',
                entity: 'User',
                entityId: user.id,
                actorId: user.id,
                metadata: JSON.stringify({ email: user.email, role: user.role, ip })
            }
        });

        const response = NextResponse.json({
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

        return applySecurityHeaders(response, { noStore: true });

    } catch (error) {
        return handleApiError(error);
    }
}
