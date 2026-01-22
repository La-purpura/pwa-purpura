import { NextResponse } from "next/server";
import { db, DbTask } from "@/lib/server-db";

// GET: Obtener todas las tareas (Filtrable por territorio opcionalmente)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const territory = searchParams.get('territory');

  let tasks = db.tasks.getAll();

  if (territory && territory !== 'Nacional') {
    tasks = tasks.filter(t => t.territory === territory);
  }

  return NextResponse.json(tasks);
}

// POST: Crear nueva tarea (Desde Dashboard)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validación básica
    if (!body.title || !body.territory) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const newTaskData = {
      title: body.title,
      description: body.description || "",
      status: "pending" as const,
      priority: body.priority || "medium",
      territory: body.territory,
      assigneeId: body.assigneeId,
      dueDate: body.dueDate || new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    const newTask = db.tasks.create(newTaskData);

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
