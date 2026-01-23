import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, handleApiError } from "@/lib/guard";

export const dynamic = 'force-dynamic';

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

        if (existing.submittedById !== session.sub && session.role !== 'SuperAdminNacional') {
            return NextResponse.json({ error: "No tienes permiso para editar esta solicitud" }, { status: 403 });
        }

        const updated = await prisma.request.update({
            where: { id },
            data: {
                type: body.type,
                data: typeof body.data === 'string' ? body.data : JSON.stringify(body.data),
                feedback: body.feedback
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        return handleApiError(error);
    }
}
