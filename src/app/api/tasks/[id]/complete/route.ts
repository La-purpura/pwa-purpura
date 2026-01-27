import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, enforceScope, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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

        const scopeFilter = await enforceScope(session, { isMany: true, relationName: 'territories' });

        // Verificar existencia y alcance
        const taskExists = await prisma.task.findFirst({
            where: { id, ...scopeFilter }
        });

        if (!taskExists) {
            return NextResponse.json({ error: "Tarea no encontrada o fuera de alcance" }, { status: 404 });
        }

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
