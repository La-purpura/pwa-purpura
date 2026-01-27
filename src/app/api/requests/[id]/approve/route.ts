import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, enforceScope, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/requests/:id/approve
 */
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requirePermission('forms:approve');
        const { id } = params;

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
            data: { status: 'approved' }
        });

        logAudit("REQUEST_APPROVED", "Request", id, session.sub, { oldStatus: existing.status });

        await createNotification(
            existing.submittedById,
            "Solicitud Aprobada",
            `Tu solicitud ha sido aprobada.`,
            "success",
            { requestId: id }
        );

        return NextResponse.json(updated);
    } catch (error) {
        return handleApiError(error);
    }
}
