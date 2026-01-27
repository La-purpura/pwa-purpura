import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, requirePermission, enforceScope, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/resources
 * Filtra por categoría, búsqueda (q) y alcance territorial.
 */
export async function GET(request: Request) {
    try {
        const session = await requireAuth(); // O requirePermission('resources:view') si existe
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const query = searchParams.get('q');

        // ABAC Many-to-Many
        const scopeFilter = await enforceScope(session, { isMany: true, relationName: 'territories', logic: 'OR' });

        const where: any = { ...scopeFilter };

        if (category && category !== 'all') {
            where.category = category;
        }

        if (query) {
            where.OR = [
                ...(where.OR || []),
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } }
            ];
        }

        const resources = await prisma.resource.findMany({
            where,
            include: {
                author: { select: { name: true } },
                territories: { include: { territory: { select: { name: true } } } }
            },
            orderBy: { createdAt: 'desc' }
        });

        const mapped = resources.map(r => ({
            ...r,
            territoryNames: r.territories.map(t => t.territory.name).join(', ') || 'Global'
        }));

        return NextResponse.json(mapped);
    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * POST /api/resources
 * Crea un nuevo recurso (Solo Admin).
 */
export async function POST(request: Request) {
    try {
        const session = await requirePermission('resources:manage');
        const body = await request.json();

        const { territoryIds, ...rest } = body;

        const resource = await prisma.resource.create({
            data: {
                title: rest.title,
                description: rest.description,
                url: rest.url,
                category: rest.category || 'Varios',
                branchId: rest.branchId || null,
                authorId: session.sub,
                territories: {
                    create: (territoryIds || []).map((tid: string) => ({
                        territoryId: tid
                    }))
                }
            }
        });

        logAudit("RESOURCE_UPLOADED", "Resource", resource.id, session.sub, {
            title: resource.title,
            category: resource.category
        });

        return NextResponse.json(resource, { status: 201 });
    } catch (error) {
        return handleApiError(error);
    }
}
