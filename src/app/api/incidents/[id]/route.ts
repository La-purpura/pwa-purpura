import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';

// GET: Get incident details
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requirePermission('incidents:view');
        const { id } = params;

        const incident = await prisma.incident.findUnique({
            where: { id },
            include: {
                reportedBy: {
                    select: { name: true, email: true, role: true }
                },
                assignedTo: {
                    select: { name: true, email: true, role: true }
                },
                territory: {
                    select: { name: true }
                }
            }
        });

        if (!incident) {
            return NextResponse.json({ error: "Incidencia no encontrada" }, { status: 404 });
        }

        return NextResponse.json(incident);
    } catch (error) {
        return handleApiError(error);
    }
}

// PATCH: Update incident (status, assignment, etc.)
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requirePermission('incidents:manage');
        const { id } = params;
        const body = await request.json();

        const updateData: any = {};

        if (body.status) updateData.status = body.status;
        if (body.assignedToId !== undefined) updateData.assignedToId = body.assignedToId;
        if (body.priority) updateData.priority = body.priority;

        if (body.status === 'RESOLVED' || body.status === 'CLOSED') {
            updateData.resolvedAt = new Date();
        }

        const incident = await prisma.incident.update({
            where: { id },
            data: updateData
        });

        logAudit("TASK_UPDATED", "Incident", incident.id, session.sub, {
            changes: updateData
        });

        return NextResponse.json(incident);
    } catch (error) {
        return handleApiError(error);
    }
}
