import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, handleApiError, applySecurityHeaders } from "@/lib/guard";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const session = await requireAuth();
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '20');

        const notifications = await prisma.notification.findMany({
            where: { userId: session.sub },
            orderBy: { createdAt: 'desc' },
            take: limit
        });

        // Parse data JSON if string
        const safeNotifications = notifications.map(n => ({
            ...n,
            data: typeof n.data === 'string' ? JSON.parse(n.data) : n.data
        }));

        return applySecurityHeaders(NextResponse.json(safeNotifications), { noStore: true });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: Request) {
    try {
        const session = await requireAuth();
        // Optional: restrict to admins
        if (session.role !== 'admin' && session.role !== 'superadmin') {
            return NextResponse.json({ error: "No autorizado" }, { status: 403 });
        }

        const body = await request.json();
        const { userId, title, message, type = 'info', data } = body;

        if (!userId || !title || !message) {
            return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
        }

        const notification = await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                data: data ? JSON.stringify(data) : undefined
            }
        });

        return applySecurityHeaders(NextResponse.json(notification, { status: 201 }));
    } catch (error) {
        return handleApiError(error);
    }
}
