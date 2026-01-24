import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

/**
 * GET /api/projects/:id
 */
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await requirePermission('projects:view');
        const { id } = params;

        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                leader: { select: { id: true, name: true, email: true } },
                territories: { include: { territory: { select: { name: true } } } },
                kpis: true,
                milestones: { orderBy: { endDate: 'asc' } },
                risks: true
            }
        });

        if (!project) return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });

        return NextResponse.json(project);

    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * PATCH /api/projects/:id
 */
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requirePermission('projects:create'); // O similar
        const { id } = params;
        const body = await request.json();

        // Borrar relaciones si se envían nuevas
        if (body.territoryIds) {
            await prisma.projectTerritory.deleteMany({ where: { projectId: id } });
            body.territories = {
                create: body.territoryIds.map((tid: string) => ({ territoryId: tid }))
            };
            delete body.territoryIds;
        }

        const project = await prisma.project.update({
            where: { id },
            data: body
        });

        logAudit("PROJECT_APPROVED", "Project", id, session.sub, { updates: body });

        return NextResponse.json(project);
    } catch (error) {
        return handleApiError(error);
    }
}
