import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { requirePermission, enforceScope, handleApiError, applySecurityHeaders } from "@/lib/guard";
import { logAudit } from "@/lib/audit";
import { ProjectSchema } from "@/lib/schemas";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/projects
 */
export async function GET(request: Request) {
    try {
        const session = await requirePermission('projects:view');
        const { searchParams } = new URL(request.url);

        const status = searchParams.get('status');
        const territoryId = searchParams.get('territoryId');
        const query = searchParams.get('q');

        const scopeFilter = await enforceScope(session, { isMany: true, relationName: 'territories' });

        const where: any = {
            ...scopeFilter,
            ...(status ? { status } : {}),
            ...(territoryId ? { territories: { some: { territoryId } } } : {})
        };

        if (query) {
            where.OR = [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { code: { contains: query, mode: 'insensitive' } }
            ];
        }

        const projects = await prisma.project.findMany({
            where,
            include: {
                leader: { select: { name: true } },
                territories: { include: { territory: { select: { name: true } } } },
                kpis: true,
                milestones: { orderBy: { endDate: 'asc' } }
            },
            orderBy: { createdAt: 'desc' }
        });

        const response = NextResponse.json(projects);
        return applySecurityHeaders(response);
    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * POST /api/projects
 */
export async function POST(request: Request) {
    try {
        const session = await requirePermission('projects:create');
        const body = await request.json();

        // Validation
        const result = ProjectSchema.safeParse(body);
        if (!result.success) {
            return handleApiError(result.error);
        }

        const { title, description, branch, type, priority, territoryIds: requestedTerritoryIds, milestones } = result.data;

        // Validar alcance territorial para creación
        let finalTerritoryIds = requestedTerritoryIds || [];

        if (session.role !== 'SuperAdminNacional') {
            const accessibleTerritories = await prisma.territory.findMany({
                where: {
                    id: { in: (finalTerritoryIds.length > 0 ? finalTerritoryIds : (session.territoryId ? [session.territoryId] : [])) as string[] },
                    OR: [
                        { id: session.territoryId },
                        { parentId: session.territoryId } // O usar lógica recursiva si es necesario
                    ]
                },
                select: { id: true }
            });
            finalTerritoryIds = accessibleTerritories.map(t => t.id);

            // Si no envió nada o lo enviado es inválido, forzar su territorio
            if (finalTerritoryIds.length === 0 && session.territoryId) {
                finalTerritoryIds = [session.territoryId];
            }
        }

        const project = await prisma.project.create({
            data: {
                title,
                description,
                branch: branch || 'General',
                type: type || 'Operativo',
                priority: priority || 'medium',
                status: 'draft',
                leaderId: session.sub,
                code: `PRJ-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                territories: {
                    create: finalTerritoryIds.map((tid: string) => ({
                        territoryId: tid
                    }))
                },
                milestones: milestones && milestones.length > 0 ? {
                    create: milestones.map((m: any) => ({
                        name: m.name,
                        status: 'pending',
                        endDate: m.endDate ? new Date(m.endDate) : null
                    }))
                } : undefined
            },
            include: {
                territories: { include: { territory: true } },
                leader: { select: { id: true, name: true, alias: true } }
            }
        });

        logAudit("PROJECT_CREATED", "Project", project.id, session.sub, { title });

        const response = NextResponse.json(project, { status: 201 });
        return applySecurityHeaders(response);
    } catch (error) {
        return handleApiError(error);
    }
}
