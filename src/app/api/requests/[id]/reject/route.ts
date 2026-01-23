import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, handleApiError } from "@/lib/guard";

export const dynamic = 'force-dynamic';

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

        await prisma.auditLog.create({
            data: {
                action: 'REQUEST_REJECTED',
                entity: 'Request',
                entityId: id,
                actorId: session.sub,
                metadata: JSON.stringify({ feedback })
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        return handleApiError(error);
    }
}
