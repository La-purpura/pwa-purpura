import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, requirePermission, enforceScope, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";
import { uploadFile } from "@/lib/storage";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/resources
 * Filtra por categoría, búsqueda (q) y alcance territorial.
 */
export async function GET(request: Request) {
    try {
        const session = await requireAuth();
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

        const resources: any[] = await prisma.resource.findMany({
            where,
            include: {
                author: { select: { name: true } },
                territories: { include: { territory: { select: { name: true } } } },
                // @ts-ignore
                versions: {
                    orderBy: { version: 'desc' },
                    take: 1
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const mapped = resources.map(r => {
            const latest = r.versions[0];
            return {
                id: r.id,
                title: r.title,
                description: r.description,
                category: r.category,
                branchId: r.branchId,
                author: r.author.name,
                createdAt: r.createdAt,
                // Computed fields
                fileName: latest?.fileName || 'unknown',
                fileSize: latest?.fileSize || 0,
                version: latest?.version || 0,
                territoryNames: r.territories.map((t: any) => t.territory.name).join(', ') || 'Global',
                downloadUrl: `/api/resources/${r.id}/download` // Endpoint to get signed url
            };
        });

        return NextResponse.json(mapped);
    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * POST /api/resources
 * Crea un nuevo recurso con archivo (FormData).
 */
export async function POST(request: Request) {
    try {
        const session = await requirePermission('resources:manage');
        const formData = await request.formData();

        const file = formData.get('file') as File;
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const category = formData.get('category') as string;
        const branchId = formData.get('branchId') as string;
        const rawTerritoryIds = formData.get('territoryIds') as string;

        if (!file || !title) {
            return NextResponse.json({ error: "Archivo y título requeridos" }, { status: 400 });
        }

        // Upload to Storage
        // Import uploadFile dynamically or at top? I'll use import at top but need to add it.
        // Assuming I added import { uploadFile } from "@/lib/storage"; at top.
        // I'll add the import in this block replacement.

        const buffer = Buffer.from(await file.arrayBuffer());
        const key = await uploadFile(file.name, buffer, file.type);

        let territoryIds: string[] = [];
        try {
            territoryIds = JSON.parse(rawTerritoryIds || '[]');
        } catch (e) { }

        const resource = await prisma.resource.create({
            data: {
                title,
                description,
                category: category || 'Varios',
                branchId: branchId || null,
                authorId: session.sub,
                territories: {
                    create: territoryIds.map((tid: string) => ({
                        territoryId: tid
                    }))
                },
                // @ts-ignore
                versions: {
                    create: {
                        version: 1,
                        fileName: file.name,
                        fileKey: key,
                        fileSize: file.size,
                        uploadedById: session.sub
                    }
                }
            }
        });

        logAudit("RESOURCE_UPLOADED", "Resource", resource.id, session.sub, {
            title: resource.title,
            fileName: file.name,
            size: file.size
        });

        return NextResponse.json(resource, { status: 201 });
    } catch (error) {
        return handleApiError(error);
    }
}
