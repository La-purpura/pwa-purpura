import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, enforceScope, handleApiError } from "@/lib/guard";

export const dynamic = 'force-dynamic';

// GET: Filtered resources based on segmentation
export async function GET(request: Request) {
    try {
        const session = await requirePermission('resources:view');
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');

        const scopeFilter = await enforceScope(session, { logic: 'OR' });
        const where: any = { ...scopeFilter };

        if (category) where.category = category;

        const resources = await prisma.resource.findMany({
            where,
            include: {
                author: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(resources);
    } catch (error) {
        return handleApiError(error);
    }
}

// POST: Add new resource (Admin/Manage only)
export async function POST(request: Request) {
    try {
        const session = await requirePermission('resources:manage');
        const body = await request.json();

        const resource = await prisma.resource.create({
            data: {
                title: body.title,
                description: body.description,
                url: body.url,
                category: body.category || 'Varios',
                branchId: body.branchId || null,
                territoryId: body.territoryId || null,
                authorId: session.sub
            }
        });

        await prisma.auditLog.create({
            data: {
                action: 'RESOURCE_UPLOADED',
                entity: 'Resource',
                entityId: resource.id,
                actorId: session.sub,
                metadata: JSON.stringify({ title: resource.title, category: resource.category })
            }
        });

        return NextResponse.json(resource, { status: 201 });
    } catch (error) {
        return handleApiError(error);
    }
}
