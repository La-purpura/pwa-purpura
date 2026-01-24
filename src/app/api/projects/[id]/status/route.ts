import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";
import { isValidTransition, canApprove } from "@/lib/projects";
import { ProjectStatus } from "@/lib/types";

/**
 * POST /api/projects/:id/status
 * Cambia el estado de un proyecto validando transiciones y permisos.
 */
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requirePermission('projects:view');
        const { id } = params;
        const { status: nextStatus } = await request.json();

        // 1. Obtener proyecto actual
        const project = await prisma.project.findUnique({
            where: { id },
            select: { status: true, leaderId: true }
        });

        if (!project) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

        const currentStatus = project.status as ProjectStatus;

        // 2. Validar Transición
        if (!isValidTransition(currentStatus, nextStatus)) {
            return NextResponse.json({
                error: `Transición inválida de ${currentStatus} a ${nextStatus}`
            }, { status: 400 });
        }

        // 3. Validar Permisos específicos (Aprobación)
        if (nextStatus === 'approved' && !canApprove(session.role)) {
            return NextResponse.json({ error: "No tienes permiso para aprobar proyectos" }, { status: 403 });
        }

        // 4. Actualizar
        const updated = await prisma.project.update({
            where: { id },
            data: { status: nextStatus }
        });

        logAudit("PROJECT_STATUS_CHANGED", "Project", id, session.sub, { from: currentStatus, to: nextStatus });

        return NextResponse.json(updated);

    } catch (error) {
        return handleApiError(error);
    }
}
