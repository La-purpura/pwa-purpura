import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, enforceScope, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await requirePermission('forms:view');
    const whereClause = await enforceScope(session);

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        assignee: { select: { name: true } },
        territory: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const mapped = tasks.map(t => ({
      ...t,
      assignee: t.assignee?.name || "Sin asignar",
      territory: t.territory?.name || "General",
      dueDate: t.dueDate?.toISOString() || ""
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requirePermission('forms:create');
    const body = await request.json();

    if (!body.title) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    let targetTerritoryId = body.territoryId;

    if (session.territoryId) {
      targetTerritoryId = session.territoryId;
    }

    const newTask = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description,
        priority: body.priority || "medium",
        status: "pending",
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        territoryId: targetTerritoryId || undefined
      }
    });

    logAudit("TASK_CREATED", "Task", newTask.id, session.sub, { title: newTask.title });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
