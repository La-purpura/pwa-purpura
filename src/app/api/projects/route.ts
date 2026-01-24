import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { requirePermission, enforceScope, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';

/**
 * GET /api/projects
 * Lista proyectos con filtros y ABAC enforcement.
 */
export async function GET(request: Request) {
    try {
        const session = await requirePermission('projects:view');
        const { searchParams } = new URL(request.url);

        const status = searchParams.get('status');
        const territoryId = searchParams.get('territoryId');
        const query = searchParams.get('q');

        // ABAC: Filtrar por alcance territorial
        const scopeFilter = await enforceScope(session);

        // Construcción de consulta compatible con ProjectTerritory
        const where: any = {
            ...status ? { status } : {},
            ...territoryId ? {
                territories: { some: { territoryId } }
            } : (scopeFilter.territoryId ? {
                territories: { some: { territoryId: scopeFilter.territoryId } }
            } : {})
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

        return NextResponse.json(projects);
    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * POST /api/projects
 * Crea un nuevo proyecto (Borrador inicial).
 */
export async function POST(request: Request) {
    try {
        const session = await requirePermission('projects:create');
        const body = await request.json();

        const { title, description, branch, type, priority, territoryIds } = body;

        if (!title) return NextResponse.json({ error: 'Título requerido' }, { status: 400 });

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
                    create: (territoryIds || []).map((tid: string) => ({
                        territoryId: tid
                    }))
                }
            },
            include: {
                territories: true,
                leader: true
            }
        });

        logAudit("PROJECT_CREATED", "Project", project.id, session.sub, { title });

        return NextResponse.json(project, { status: 201 });
    } catch (error) {
        return handleApiError(error);
    }
}
