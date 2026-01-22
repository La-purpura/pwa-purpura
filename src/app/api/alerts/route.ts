import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requirePermission, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const session = await requirePermission('incidents:view');

    // Filtros TODO: Filtrar por territoryId de sesión

    const alerts = await prisma.alert.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(alerts);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requirePermission('incidents:create');
    const body = await request.json();

    const newAlert = await prisma.alert.create({
      data: {
        title: body.title,
        type: body.type, // info, warning, error
        message: body.message,
        isRead: false
      }
    });

    logAudit("ALERT_CREATED", "Alert", newAlert.id, session.sub, { type: body.type });

    return NextResponse.json(newAlert, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
