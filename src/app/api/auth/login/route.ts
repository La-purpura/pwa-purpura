import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSessionCookie } from "@/lib/auth";
import { z } from "zod";
import { handleApiError, applySecurityHeaders } from "@/lib/guard";
import { rateLimit } from "@/lib/rate-limit";
import { verifyTwoFactorToken } from "@/lib/twofactor";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const LoginSchema = z.object({
    identifier: z.string().email().optional(),
    email: z.string().email().optional(),
    password: z.string().min(6),
    twoFactorCode: z.string().min(6).optional()
}).refine(data => data.identifier || data.email, {
    message: "Debe proporcionar un email",
    path: ["identifier"]
});

const CRITICAL_ROLES = ['SuperAdminNacional', 'AdminProvincial', 'CoordinadorRegional'];

export async function POST(request: Request) {
    try {
        // 1. Rate Limiting (Brute Force Protection)
        const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
        const limiter = rateLimit(ip, { limit: 10, windowMs: 60 * 1000 }); // Increased slightly for 2FA steps

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
        const twoFactorCode = result.data.twoFactorCode;

        // 3. User Lookup
        // @ts-ignore
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
            // Audit Log Failure
            await prisma.auditLog.create({
                data: {
                    action: 'LOGIN_FAILURE',
                    entity: 'User',
                    entityId: user.id,
                    actorId: user.id,
                    metadata: JSON.stringify({ email: user.email, ip, reason: 'invalid_password' })
                }
            });

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

        // 6. 2FA Verification
        // @ts-ignore
        const is2faEnabled = user.twoFactorEnabled;
        // @ts-ignore
        const secret = user.twoFactorSecret;
        let requiresSetup = false;
        let verified = false;

        if (is2faEnabled) {
            if (!twoFactorCode) {
                return NextResponse.json({ error: "Código 2FA requerido", code: '2FA_REQUIRED' }, { status: 403 });
            }
            if (!secret || !verifyTwoFactorToken(twoFactorCode, secret)) {
                await prisma.auditLog.create({
                    data: {
                        action: 'LOGIN_FAILURE_2FA',
                        entity: 'User',
                        entityId: user.id,
                        actorId: user.id,
                        metadata: JSON.stringify({ email: user.email, ip })
                    }
                });
                return NextResponse.json({ error: "Código 2FA inválido" }, { status: 401 });
            }
            verified = true;
        } else {
            if (CRITICAL_ROLES.includes(user.role)) {
                requiresSetup = true;
                verified = false; // Not verified, but allowed to login to setup
            } else {
                verified = true; // Not required, so effectively verified
            }
        }

        // 7. Create Session
        await createSessionCookie({
            sub: user.id,
            email: user.email,
            role: user.role,
            territoryId: user.territoryId || undefined,
            branchId: user.branchId || undefined,
            twoFactorVerified: verified
        });

        // 8. Audit Log
        await prisma.auditLog.create({
            data: {
                action: 'LOGIN_SUCCESS',
                entity: 'User',
                entityId: user.id,
                actorId: user.id,
                metadata: JSON.stringify({ email: user.email, role: user.role, ip, twoFactorEnabled: is2faEnabled })
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
                // @ts-ignore
                territoryId: user.territoryId,
                // @ts-ignore
                territory: user.territory?.name || "Global",
                // @ts-ignore
                territoryScope: user.territoryScope,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=random`,
                requires2faSetup: requiresSetup
            }
        });

        return applySecurityHeaders(response, { noStore: true });

    } catch (error) {
        return handleApiError(error);
    }
}
