import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, enforceScope, handleApiError, applySecurityHeaders } from "@/lib/guard";
import { logAudit } from "@/lib/audit";
import { TaskSchema } from "@/lib/schemas";

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
    const limit = searchParams.get('limit');

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
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        territories: { include: { territory: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : undefined
    });

    const mapped = tasks.map(t => ({
      ...t,
      assigneeName: t.assignee?.name || "Sin asignar",
      territories: t.territories.map(rel => rel.territory),
      dueDate: t.dueDate?.toISOString() || null
    }));

    const response = NextResponse.json(mapped);
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

    const response = NextResponse.json(newTask, { status: 201 });
    return applySecurityHeaders(response);
  } catch (error) {
    return handleApiError(error);
  }
}
