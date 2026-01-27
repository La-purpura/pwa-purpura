
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, handleApiError } from "@/lib/guard";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * PATCH /api/notifications/:id/read
 * Mark as read.
 */
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requireAuth();
        const { id } = params;

        // Verify ownership
        const existing = await prisma.notification.findUnique({
            where: { id }
        });

        if (!existing || existing.userId !== session.sub) {
            return NextResponse.json({ error: "Notificación no encontrada" }, { status: 404 });
        }

        await prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleApiError(error);
    }
}
