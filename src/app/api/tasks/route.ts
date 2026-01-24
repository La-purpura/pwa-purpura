import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, enforceScope, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';

/**
 * GET /api/tasks
 */
export async function GET(request: Request) {
  try {
    const session = await requirePermission('forms:view');
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const assigneeId = searchParams.get('assigneeId');
    const territoryId = searchParams.get('territoryId');
    const query = searchParams.get('q');

    // ABAC: Filtrar por alcance territorial many-to-many
    const scopeFilter = await enforceScope(session, { isMany: true, relationName: 'territories' });

    const where: any = {
      ...scopeFilter
    };

    if (status) where.status = status;
    if (assigneeId) where.assigneeId = assigneeId;

    // Filtro explícito de territorio si se envía por query
    if (territoryId) {
      where.territories = { some: { territoryId } };
    }

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
        territories: { include: { territory: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const mapped = tasks.map(t => ({
      ...t,
      assigneeName: t.assignee?.name || "Sin asignar",
      territories: t.territories.map(rel => rel.territory),
      dueDate: t.dueDate?.toISOString() || null
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/tasks
 * Acepta territoryIds[] para segmentación.
 */
export async function POST(request: Request) {
  try {
    const session = await requirePermission('forms:create');
    const body = await request.json();

    const { title, description, priority, dueDate, territoryIds, assigneeId } = body;

    if (!title) return NextResponse.json({ error: "Título obligatorio" }, { status: 400 });

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || "medium",
        status: "pending",
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId: assigneeId || null,
        territories: {
          create: (territoryIds || []).map((tid: string) => ({
            territoryId: tid
          }))
        }
      },
      include: { territories: true }
    });

    logAudit("TASK_CREATED", "Task", newTask.id, session.sub, { title });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
