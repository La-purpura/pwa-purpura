import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

/**
 * POST /api/tasks/:id/complete
 * Marca una tarea como completada.
 * Cualquier usuario con acceso a la tarea puede completarla.
 */
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requirePermission('forms:submit');
        const { id } = params;

        const task = await prisma.task.update({
            where: { id },
            data: { status: 'completed' }
        });

        logAudit("TASK_COMPLETED", "Task", id, session.sub);

        return NextResponse.json({ success: true, task });

    } catch (error) {
        return handleApiError(error);
    }
}
