import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, enforceScope, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/requests/:id/reject
 */
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requirePermission('forms:approve');
        const { id } = params;
        const { feedback } = await request.json();

        const scopeFilter = await enforceScope(session);

        const existing = await prisma.request.findFirst({
            where: {
                id,
                ...scopeFilter
            }
        });

        if (!existing) return NextResponse.json({ error: "Solicitud no encontrada o fuera de alcance" }, { status: 404 });

        const updated = await prisma.request.update({
            where: { id },
            data: {
                status: 'rejected',
                feedback
            }
        });

        logAudit("REQUEST_REJECTED", "Request", id, session.sub, { feedback });

        await createNotification(
            existing.submittedById,
            "Solicitud Rechazada",
            `Tu solicitud ha sido rechazada. Feedback: ${feedback || 'Sin comentarios'}`,
            "error",
            { requestId: id }
        );

        return NextResponse.json(updated);
    } catch (error) {
        return handleApiError(error);
    }
}
