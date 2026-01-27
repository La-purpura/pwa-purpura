import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, enforceScope, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/projects/:id/milestones
 * Crea o actualiza un hito del proyecto.
 */
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requirePermission('projects:create');
        const { id: projectId } = params;
        const body = await request.json();

        // Validar acceso al proyecto
        const scopeFilter = await enforceScope(session, { isMany: true, relationName: 'territories' });
        const project = await prisma.project.findFirst({
            where: { id: projectId, ...scopeFilter }
        });

        if (!project) {
            return NextResponse.json({ error: "Proyecto no encontrado o sin acceso" }, { status: 404 });
        }

        const { id, name, status, endDate } = body;

        let milestone;
        if (id) {
            // Update: Verificar que el hito pertenezca al proyecto
            const existing = await prisma.projectMilestone.findFirst({
                where: { id, projectId }
            });
            if (!existing) return NextResponse.json({ error: "Hito no encontrado en este proyecto" }, { status: 404 });

            milestone = await prisma.projectMilestone.update({
                where: { id },
                data: { name, status, endDate: endDate ? new Date(endDate) : null }
            });
        } else {
            // Create
            milestone = await prisma.projectMilestone.create({
                data: {
                    projectId,
                    name,
                    status: status || 'pending',
                    endDate: endDate ? new Date(endDate) : null
                }
            });
        }

        logAudit("MILESTONE_UPDATED", "ProjectMilestone", milestone.id, session.sub, { name: milestone.name });

        return NextResponse.json(milestone);

    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * DELETE /api/projects/:id/milestones
 * Borra un hito.
 */
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requirePermission('projects:create');
        const { id: projectId } = params;
        const { searchParams } = new URL(request.url);
        const milestoneId = searchParams.get('id');

        if (!milestoneId) return NextResponse.json({ error: "ID faltante" }, { status: 400 });

        // Validar acceso al proyecto
        const scopeFilter = await enforceScope(session, { isMany: true, relationName: 'territories' });
        const project = await prisma.project.findFirst({
            where: { id: projectId, ...scopeFilter }
        });

        if (!project) {
            return NextResponse.json({ error: "Proyecto no encontrado o sin acceso" }, { status: 404 });
        }

        // Verificar y borrar
        const count = await prisma.projectMilestone.deleteMany({
            where: {
                id: milestoneId,
                projectId
            }
        });

        if (count.count === 0) {
            return NextResponse.json({ error: "Hito no encontrado" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleApiError(error);
    }
}
