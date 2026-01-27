import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * PATCH /api/resources/:id
 */
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requirePermission('resources:manage');
        const body = await request.json();
        const { id } = params;

        const { territoryIds, ...rest } = body;

        // Si se envían territorios, actualizar la relación
        if (territoryIds) {
            await prisma.resourceTerritory.deleteMany({ where: { resourceId: id } });
            rest.territories = {
                create: territoryIds.map((tid: string) => ({ territoryId: tid }))
            };
        }

        const updated = await prisma.resource.update({
            where: { id },
            data: rest
        });

        logAudit("RESOURCE_UPDATED", "Resource", id, session.sub, { updates: rest });

        return NextResponse.json(updated);
    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * DELETE /api/resources/:id
 */
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requirePermission('resources:manage');
        const { id } = params;

        await prisma.resource.delete({ where: { id } });

        logAudit("RESOURCE_DELETED", "Resource", id, session.sub);

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleApiError(error);
    }
}
