
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, handleApiError, applySecurityHeaders } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/admin/sessions
 * List active sessions.
 */
export async function GET(request: Request) {
    try {
        const session = await requirePermission('users:manage'); // Admin only

        // Fetch sessions joined with user email
        const sessions = await prisma.session.findMany({
            where: {
                revokedAt: null,
                expiresAt: { gt: new Date() },
                // Optional: Filter by specific user if query param provided
            },
            include: {
                user: { select: { email: true, name: true, role: true } }
            },
            orderBy: { lastActive: 'desc' },
            take: 100
        });

        const mapped = sessions.map(s => ({
            id: s.id,
            userId: s.userId,
            userEmail: s.user.email,
            userName: s.user.name,
            userRole: s.user.role,
            ipAddress: s.ipAddress,
            userAgent: s.userAgent,
            lastActive: s.lastActive,
            createdAt: s.createdAt,
            expiresAt: s.expiresAt
        }));

        return applySecurityHeaders(NextResponse.json(mapped), { noStore: true });
    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * DELETE /api/admin/sessions
 * Revoke session(s).
 * Body: { sessionId: string } or { userId: string, all: true }
 */
export async function DELETE(request: Request) {
    try {
        const session = await requirePermission('users:manage');
        const body = await request.json();

        if (body.sessionId) {
            await prisma.session.update({
                where: { id: body.sessionId },
                data: { revokedAt: new Date() }
            });
            logAudit("SESSION_REVOKED", "Session", body.sessionId, session.sub, { reason: 'admin_action' });
        } else if (body.userId && body.all) {
            await prisma.session.updateMany({
                where: {
                    userId: body.userId,
                    revokedAt: null
                },
                data: { revokedAt: new Date() }
            });
            logAudit("SESSIONS_REVOKED_ALL", "User", body.userId, session.sub, { reason: 'admin_action' });
        } else {
            return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        return handleApiError(error);
    }
}
