import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, handleApiError, applySecurityHeaders } from "@/lib/guard";

export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await requireAuth();

        // Verify ownership
        const notification = await prisma.notification.findUnique({
            where: { id: params.id },
            select: { userId: true }
        });

        if (!notification) {
            return NextResponse.json({ error: "Notificación no encontrada" }, { status: 404 });
        }

        if (notification.userId !== session.sub) {
            return NextResponse.json({ error: "No autorizado" }, { status: 403 });
        }

        await prisma.notification.update({
            where: { id: params.id },
            data: { isRead: true }
        });

        return applySecurityHeaders(NextResponse.json({ success: true }));
    } catch (error) {
        return handleApiError(error);
    }
}
