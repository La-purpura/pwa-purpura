import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requirePermission, handleApiError } from "@/lib/guard";

const prisma = new PrismaClient();

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requirePermission('forms:approve');
        const { id } = params;
        const { feedback } = await request.json();

        const existing = await prisma.request.findUnique({ where: { id } });
        if (!existing) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

        const updated = await prisma.request.update({
            where: { id },
            data: {
                status: 'rejected',
                feedback
            }
        });

        // Auditoría
        await prisma.auditLog.create({
            data: {
                action: 'REQUEST_REJECTED',
                entity: 'Request',
                entityId: id,
                actorId: session.userId,
                metadata: JSON.stringify({ feedback })
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        return handleApiError(error);
    }
}
