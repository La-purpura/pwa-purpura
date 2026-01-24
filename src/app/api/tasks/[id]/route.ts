import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

/**
 * GET /api/tasks/:id
 */
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await requirePermission('forms:view');
        const { id } = params;

        const task = await prisma.task.findUnique({
            where: { id },
            include: {
                assignee: { select: { id: true, name: true, email: true } },
                territory: { select: { id: true, name: true } }
            }
        });

        if (!task) return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });

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
        const session = await requirePermission('forms:create'); // O 'forms:review' según política
        const { id } = params;
        const body = await request.json();

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
        const session = await requirePermission('templates:manage'); // Solo admins/coord de alto nivel borradores
        const { id } = params;

        await prisma.task.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleApiError(error);
    }
}
