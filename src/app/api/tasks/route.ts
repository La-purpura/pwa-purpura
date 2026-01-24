import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, enforceScope, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';

/**
 * GET /api/tasks
 * Lista tareas filtradas por status, asignado, territorio y búsqueda.
 * Incluye ABAC enforcement.
 */
export async function GET(request: Request) {
  try {
    const session = await requirePermission('forms:view');
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const assigneeId = searchParams.get('assigneeId');
    const territoryId = searchParams.get('territoryId');
    const query = searchParams.get('q');

    // 1. Obtener filtro base de alcance (ABAC)
    const scopeFilter = await enforceScope(session);

    // 2. Construir Where Clause
    const where: any = {
      ...scopeFilter
    };

    if (status) where.status = status;
    if (assigneeId) where.assigneeId = assigneeId;
    if (territoryId) where.territoryId = territoryId;
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        territory: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // 3. Mapeo para frontend
    const mapped = tasks.map(t => ({
      ...t,
      assigneeName: t.assignee?.name || "Sin asignar",
      territoryName: t.territory?.name || "Nacional",
      dueDate: t.dueDate?.toISOString() || null
    }));

    return NextResponse.json(mapped);

  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/tasks
 * Crea una nueva tarea.
 */
export async function POST(request: Request) {
  try {
    const session = await requirePermission('forms:create');
    const body = await request.json();

    const { title, description, priority, dueDate, territoryId, assigneeId } = body;

    if (!title) {
      return NextResponse.json({ error: "El título es obligatorio" }, { status: 400 });
    }

    // Valida que si no es admin, no pueda crear tareas fuera de su territorio
    let finalTerritoryId = territoryId;
    if (session.role !== 'SuperAdminNacional' && session.territoryId) {
      finalTerritoryId = session.territoryId;
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || "medium",
        status: "pending",
        dueDate: dueDate ? new Date(dueDate) : null,
        territoryId: finalTerritoryId || null,
        assigneeId: assigneeId || null
      }
    });

    logAudit("TASK_CREATED", "Task", newTask.id, session.sub, { title });

    return NextResponse.json(newTask, { status: 201 });

  } catch (error) {
    return handleApiError(error);
  }
}
