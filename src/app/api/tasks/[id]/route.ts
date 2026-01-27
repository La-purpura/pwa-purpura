import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, enforceScope, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/tasks/:id
 */
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requirePermission('forms:view');
        const { id } = params;

        const scopeFilter = await enforceScope(session, { isMany: true, relationName: 'territories' });

        const task = await prisma.task.findFirst({
            where: {
                id,
                ...scopeFilter
            },
            include: {
                assignee: { select: { id: true, name: true, email: true } },
                territories: {
                    include: {
                        territory: { select: { id: true, name: true } }
                    }
                }
            }
        });

        if (!task) return NextResponse.json({ error: "Tarea no encontrada o sin acceso" }, { status: 404 });

        return NextResponse.json(task);

    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * PATCH /api/tasks/:id
 */
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requirePermission('forms:create');
        const { id } = params;
        const body = await request.json();

        const scopeFilter = await enforceScope(session, { isMany: true, relationName: 'territories' });

        // Verificar existencia y alcance
        const taskExists = await prisma.task.findFirst({
            where: { id, ...scopeFilter }
        });

        if (!taskExists) {
            return NextResponse.json({ error: "Tarea no encontrada o fuera de alcance" }, { status: 404 });
        }

        const updated = await prisma.task.update({
            where: { id },
            data: body
        });

        logAudit("TASK_UPDATED", "Task", id, session.sub, { updates: body });

        return NextResponse.json(updated);
    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * DELETE /api/tasks/:id
 */
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requirePermission('templates:manage');
        const { id } = params;

        const scopeFilter = await enforceScope(session, { isMany: true, relationName: 'territories' });

        // Verificar existencia y alcance
        const taskExists = await prisma.task.findFirst({
            where: { id, ...scopeFilter }
        });

        if (!taskExists) {
            return NextResponse.json({ error: "Tarea no encontrada o fuera de alcance" }, { status: 404 });
        }

        await prisma.task.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleApiError(error);
    }
}
