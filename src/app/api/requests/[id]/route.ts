import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requirePermission, handleApiError } from "@/lib/guard";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

// PATCH: Update request data (only if pending)
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requirePermission('forms:create');
        const { id } = params;
        const body = await request.json();

        const existing = await prisma.request.findUnique({
            where: { id }
        });

        if (!existing) {
            return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
        }

        if (existing.status !== 'pending') {
            return NextResponse.json({ error: "Solo se pueden editar solicitudes pendientes" }, { status: 400 });
        }

        // Permission check for ownership or admin
        if (existing.submittedById !== session.userId && session.role !== 'SuperAdminNacional') {
            return NextResponse.json({ error: "No tienes permiso para editar esta solicitud" }, { status: 403 });
        }

        const updated = await prisma.request.update({
            where: { id },
            data: {
                type: body.type,
                data: typeof body.data === 'string' ? body.data : JSON.stringify(body.data),
                feedback: body.feedback // If user wants to clear or update their own comments
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        return handleApiError(error);
    }
}
