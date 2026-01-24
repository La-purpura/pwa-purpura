import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, requirePermission, enforceScope, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';

/**
 * GET /api/alerts
 * Devuelve la lista de alertas activas con filtros y estado de lectura por usuario.
 */
export async function GET(request: Request) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status') || 'active';
    const severity = searchParams.get('severity');
    const territoryId = searchParams.get('territoryId');
    const query = searchParams.get('q');

    // ABAC: Un usuario ve alertas globales O de su territorio
    const scopeFilter = await enforceScope(session, { logic: 'OR' });

    const where: any = {
      status,
      ...scopeFilter
    };

    if (severity) where.severity = severity;
    if (territoryId) where.territoryId = territoryId;
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { message: { contains: query, mode: 'insensitive' } }
      ];
    }

    const alerts = await prisma.alert.findMany({
      where,
      include: {
        territory: { select: { name: true } },
        reads: {
          where: { userId: session.sub }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Mapear para incluir isRead booleano simple
    const mapped = alerts.map(a => ({
      ...a,
      isRead: a.reads.length > 0,
      territoryName: a.territory?.name || "Global"
    }));

    return NextResponse.json(mapped, {
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    });

  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/alerts
 * Crea una nueva alerta (Broadcast).
 */
export async function POST(request: Request) {
  try {
    const session = await requirePermission('posts:create'); // Usamos permiso de posts como base
    const body = await request.json();

    const { title, message, type, severity, territoryId } = body;

    if (!title || !message) {
      return NextResponse.json({ error: "Título y mensaje requeridos" }, { status: 400 });
    }

    const alert = await prisma.alert.create({
      data: {
        title,
        message,
        type: type || 'info',
        severity: severity || 'medium',
        territoryId: territoryId || null
      }
    });

    logAudit("ALERT_CREATED", "Alert", alert.id, session.sub, { title });

    return NextResponse.json(alert, { status: 201 });

  } catch (error) {
    return handleApiError(error);
  }
}
