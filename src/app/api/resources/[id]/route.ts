import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, handleApiError } from "@/lib/guard";

// PATCH: Update resource
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requirePermission('resources:manage');
        const { id } = params;
        const body = await request.json();

        const resource = await prisma.resource.update({
            where: { id },
            data: {
                title: body.title,
                description: body.description,
                url: body.url,
                category: body.category,
                branchId: body.branchId,
                territoryId: body.territoryId
            }
        });

        return NextResponse.json(resource);
    } catch (error) {
        return handleApiError(error);
    }
}

// DELETE: Remove resource
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requirePermission('resources:manage');
        const { id } = params;

        const resource = await prisma.resource.delete({
            where: { id }
        });

        // Auditoría
        await prisma.auditLog.create({
            data: {
                action: 'RESOURCE_DELETED',
                entity: 'Resource',
                entityId: id,
                actorId: session.sub,
                metadata: JSON.stringify({ title: resource.title })
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleApiError(error);
    }
}
