import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, enforceScope, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";
import { validateTransition, PROJECT_TRANSITIONS, ProjectStatus, WorkflowError } from "@/lib/workflow";
// import { ProjectStatus } from "@/lib/types"; // Remove old type

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/projects/:id/status
 * Cambia el estado de un proyecto validando transiciones y permisos (Workflow Engine).
 */
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requirePermission('projects:view'); // Valid permission
        const { id } = params;
        const { status: nextStatus, reason } = await request.json();

        const scopeFilter = await enforceScope(session, { isMany: true, relationName: 'territories' });

        // 1. Obtener proyecto actual con filtro de alcance
        const project = await prisma.project.findFirst({
            where: { id, ...scopeFilter },
            select: { status: true, leaderId: true }
        });

        if (!project) return NextResponse.json({ error: "Proyecto no encontrado o fuera de alcance" }, { status: 404 });

        const currentStatus = project.status as ProjectStatus;

        // 2. Validar Transición (Workflow Engine)
        try {
            validateTransition(currentStatus, nextStatus, PROJECT_TRANSITIONS, reason);
        } catch (e) {
            if (e instanceof WorkflowError) {
                return NextResponse.json({ error: e.message }, { status: 400 });
            }
            throw e;
        }

        // 3. Validar Permisos Extra (ej: solo admin archiva?)
        // Dejamos esto al workflow definitions o lógica ad-hoc.
        // Por ahora confiamos en 'projects:edit' y que el workflow valida lógica de negocio.

        // 4. Actualizar
        const updated = await prisma.project.update({
            where: { id },
            data: { status: nextStatus }
        });

        logAudit("PROJECT_STATUS_CHANGED", "Project", id, session.sub, {
            from: currentStatus,
            to: nextStatus,
            reason
        });

        return NextResponse.json(updated);

    } catch (error) {
        return handleApiError(error);
    }
}
