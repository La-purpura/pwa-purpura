import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, enforceScope, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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

        const scopeFilter = await enforceScope(session, { isMany: true, relationName: 'territories' });

        const existing = await prisma.alert.findFirst({
            where: { id, ...scopeFilter }
        });

        if (!existing) {
            return NextResponse.json({ error: "Alerta no encontrada o fuera de alcance" }, { status: 404 });
        }

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
        const session = await requirePermission('posts:create');
        const { id } = params;

        const scopeFilter = await enforceScope(session, { isMany: true, relationName: 'territories' });

        const existing = await prisma.alert.findFirst({
            where: { id, ...scopeFilter }
        });

        if (!existing) {
            return NextResponse.json({ error: "Alerta no encontrada o fuera de alcance" }, { status: 404 });
        }

        await prisma.alert.delete({ where: { id } });

        return NextResponse.json({ success: true });

    } catch (error) {
        return handleApiError(error);
    }
}
