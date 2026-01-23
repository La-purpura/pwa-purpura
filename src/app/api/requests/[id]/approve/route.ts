import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requirePermission, handleApiError } from "@/lib/guard";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requirePermission('forms:approve');
        const { id } = params;

        const existing = await prisma.request.findUnique({ where: { id } });
        if (!existing) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

        const updated = await prisma.request.update({
            where: { id },
            data: { status: 'approved' }
        });

        // Auditoría
        await prisma.auditLog.create({
            data: {
                action: 'REQUEST_APPROVED',
                entity: 'Request',
                entityId: id,
                actorId: session.userId,
                metadata: JSON.stringify({ oldStatus: existing.status, newStatus: 'approved' })
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        return handleApiError(error);
    }
}
