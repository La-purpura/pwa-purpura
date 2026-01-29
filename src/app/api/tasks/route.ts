import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, enforceScope, handleApiError, applySecurityHeaders } from "@/lib/guard";
import { logAudit } from "@/lib/audit";
import { TaskSchema } from "@/lib/validators";
import { createNotification } from "@/lib/notifications";
import { validateETag, generateETag } from "@/lib/performance";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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
    const cursor = searchParams.get('cursor');
    const limitParams = searchParams.get('limit');
    const limit = limitParams ? Math.min(parseInt(limitParams), 50) : 20;

    const scopeFilter = await enforceScope(session, { isMany: true, relationName: 'territories' });

    const where: any = {
      ...scopeFilter
    };

    if (status) where.status = status;
    if (assigneeId) where.assigneeId = assigneeId;

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
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        territories: { include: { territory: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Performance: Support ETag
    const isCached = validateETag(request, tasks);
    if (isCached) return new NextResponse(null, { status: 304 });

    let nextCursor = null;
    if (tasks.length > limit) {
      const nextItem = tasks.pop();
      nextCursor = nextItem?.id;
    }

    const mapped = tasks.map(t => ({
      ...t,
      assigneeName: t.assignee?.name || "Sin asignar",
      territories: t.territories.map(rel => rel.territory),
      dueDate: t.dueDate?.toISOString() || null
    }));

    const response = NextResponse.json({ items: mapped, nextCursor }, {
      headers: {
        'ETag': generateETag(tasks),
        'Cache-Control': 'no-cache'
      }
    });
    return applySecurityHeaders(response);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/tasks
 */
export async function POST(request: Request) {
  try {
    const session = await requirePermission('forms:create');
    const body = await request.json();

    // Input Validation
    const result = TaskSchema.safeParse(body);
    if (!result.success) {
      return handleApiError(result.error);
    }

    const { title, description, priority, dueDate, territoryIds, assigneeId } = result.data;

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

    if (assigneeId) {
      await createNotification(
        assigneeId,
        "Nueva Tarea Asignada",
        `Se te ha asignado la tarea: ${title}`,
        "info",
        { taskId: newTask.id, url: `/tasks` }
      );
    }

    const response = NextResponse.json(newTask, { status: 201 });
    return applySecurityHeaders(response);
  } catch (error) {
    return handleApiError(error);
  }
}
