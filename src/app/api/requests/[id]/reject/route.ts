import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';

/**
 * POST /api/requests/:id/reject
 */
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

        logAudit("REQUEST_REJECTED", "Request", id, session.sub, { feedback });

        return NextResponse.json(updated);
    } catch (error) {
        return handleApiError(error);
    }
}
