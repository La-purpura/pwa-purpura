import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, enforceScope, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";
import { validateTransition, REQUEST_TRANSITIONS, RequestStatus, WorkflowError } from "@/lib/workflow";

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
        const { reason } = await request.json().catch(() => ({ reason: undefined }));

        const scopeFilter = await enforceScope(session);

        const existing = await prisma.request.findFirst({
            where: {
                id,
                ...scopeFilter
            }
        });

        if (!existing) return NextResponse.json({ error: "Solicitud no encontrada o fuera de alcance" }, { status: 404 });

        // Workflow Validation
        try {
            validateTransition(existing.status as RequestStatus, 'approved', REQUEST_TRANSITIONS, reason);
        } catch (e) {
            if (e instanceof WorkflowError) {
                return NextResponse.json({ error: e.message }, { status: 400 });
            }
            throw e;
        }

        const updated = await prisma.request.update({
            where: { id },
            data: {
                status: 'approved',
                feedback: reason // Store approval notes in feedback
            }
        });

        logAudit("REQUEST_APPROVED", "Request", id, session.sub, {
            oldStatus: existing.status,
            reason
        });

        await createNotification(
            existing.submittedById,
            "Solicitud Aprobada",
            "Tu solicitud ha sido aprobada.",
            "success",
            { requestId: id }
        );

        return NextResponse.json(updated);
    } catch (error) {
        return handleApiError(error);
    }
}
