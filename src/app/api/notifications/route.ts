
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, handleApiError, applySecurityHeaders } from "@/lib/guard";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/notifications
 * Get user notifications.
 */
export async function GET(request: Request) {
    try {
        const session = await requireAuth();
        const { searchParams } = new URL(request.url);
        const unreadOnly = searchParams.get('unread') === 'true';

        const where: any = { userId: session.sub };
        if (unreadOnly) {
            where.isRead = false;
        }

        const notifications = await prisma.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        // Count unread
        const unreadCount = await prisma.notification.count({
            where: { userId: session.sub, isRead: false }
        });

        const response = NextResponse.json({
            notifications,
            unreadCount
        });

        return applySecurityHeaders(response, { noStore: true });
    } catch (error) {
        return handleApiError(error);
    }
}
