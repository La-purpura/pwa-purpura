import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

/**
 * POST /api/tasks/:id/reassign
 * Reasigna una tarea a un nuevo usuario.
 * Solo coordinadores o superiores.
 */
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requirePermission('forms:review');
        const { id } = params;
        const { assigneeId } = await request.json();

        if (!assigneeId) {
            return NextResponse.json({ error: "ID de asignado requerido" }, { status: 400 });
        }

        const task = await prisma.task.update({
            where: { id },
            data: { assigneeId }
        });

        logAudit("TASK_ASSIGNED", "Task", id, session.sub, { assigneeId });

        return NextResponse.json({ success: true, task });

    } catch (error) {
        return handleApiError(error);
    }
}
