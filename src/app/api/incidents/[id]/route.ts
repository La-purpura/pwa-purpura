import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, enforceScope, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET: Obtener detalles de la incidencia
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requirePermission('reports:view');
        const { id } = params;

        const scopeFilter = await enforceScope(session, { isMany: true, relationName: 'territories' });

        const report = await prisma.report.findFirst({
            where: {
                id,
                ...scopeFilter
            },
            include: {
                reportedBy: {
                    select: { name: true, alias: true, email: true, role: true }
                },
                assignedTo: {
                    select: { name: true, alias: true, email: true, role: true }
                },
                territories: {
                    include: { territory: { select: { name: true } } }
                }
            }
        });

        if (!report) {
            return NextResponse.json({ error: "Incidencia no encontrada o sin acceso" }, { status: 404 });
        }

        return NextResponse.json(report);
    } catch (error) {
        return handleApiError(error);
    }
}

// PATCH: Actualizar incidencia (estado, asignación, etc.)
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requirePermission('reports:manage');
        const { id } = params;
        const body = await request.json();

        const updateData: any = {};

        if (body.status) updateData.status = body.status;
        if (body.assignedToId !== undefined) updateData.assignedToId = body.assignedToId;
        if (body.priority) updateData.priority = body.priority;

        if (body.status === 'RESOLVED' || body.status === 'CLOSED') {
            updateData.resolvedAt = new Date();
        }

        const report = await prisma.report.update({
            where: { id },
            data: updateData
        });

        logAudit("REPORT_UPDATED", "Report", report.id, session.sub, {
            changes: updateData
        });

        return NextResponse.json(report);
    } catch (error) {
        return handleApiError(error);
    }
}
