import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, enforceScope, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/projects/:id
 */
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requirePermission('projects:view');
        const { id } = params;

        const scopeFilter = await enforceScope(session, { isMany: true, relationName: 'territories' });

        const project = await prisma.project.findFirst({
            where: {
                id,
                ...scopeFilter
            },
            include: {
                leader: { select: { id: true, name: true, email: true } },
                territories: { include: { territory: { select: { name: true } } } },
                kpis: true,
                milestones: { orderBy: { endDate: 'asc' } },
                risks: true
            }
        });

        if (!project) return NextResponse.json({ error: "Proyecto no encontrado o sin acceso" }, { status: 404 });

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

        const scopeFilter = await enforceScope(session, { isMany: true, relationName: 'territories' });

        const existing = await prisma.project.findFirst({
            where: { id, ...scopeFilter }
        });

        if (!existing) {
            return NextResponse.json({ error: "Proyecto no encontrado o sin acceso" }, { status: 404 });
        }

        const data: any = { ...body };

        // Borrar relaciones si se envían nuevas y validar alcance
        if (body.territoryIds) {
            let finalTerritoryIds = body.territoryIds;

            // Si no es SuperAdmin, validar que los territorios estén en su alcance
            if (session.role !== 'SuperAdminNacional') {
                const accessible = await prisma.territory.findMany({
                    where: {
                        id: { in: finalTerritoryIds },
                        OR: [
                            { id: session.territoryId },
                            { parentId: session.territoryId }
                        ]
                    },
                    select: { id: true }
                });
                finalTerritoryIds = accessible.map(t => t.id);
            }

            if (finalTerritoryIds.length > 0) {
                await prisma.projectTerritory.deleteMany({ where: { projectId: id } });
                data.territories = {
                    create: finalTerritoryIds.map((tid: string) => ({ territoryId: tid }))
                };
            }
            delete data.territoryIds;
        }

        const project = await prisma.project.update({
            where: { id },
            data
        });

        logAudit("PROJECT_UPDATED", "Project", id, session.sub, { updates: body });

        return NextResponse.json(project);
    } catch (error) {
        return handleApiError(error);
    }
}
