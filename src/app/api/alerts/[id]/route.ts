import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

/**
 * PATCH /api/alerts/:id
 * Actualiza estado o severidad de una alerta.
 */
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requirePermission('posts:create');
        const { id } = params;
        const body = await request.json();

        const updated = await prisma.alert.update({
            where: { id },
            data: body
        });

        logAudit("ALERT_UPDATED", "Alert", id, session.sub, { updates: body });

        return NextResponse.json(updated);

    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * DELETE /api/alerts/:id
 */
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await requirePermission('posts:create');
        const { id } = params;

        await prisma.alert.delete({ where: { id } });

        return NextResponse.json({ success: true });

    } catch (error) {
        return handleApiError(error);
    }
}
