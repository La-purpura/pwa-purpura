import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

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

        const { id, name, status, endDate } = body;

        let milestone;
        if (id) {
            // Update
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
export async function DELETE(request: Request) {
    try {
        const session = await requirePermission('projects:create');
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: "ID faltante" }, { status: 400 });

        await prisma.projectMilestone.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleApiError(error);
    }
}
