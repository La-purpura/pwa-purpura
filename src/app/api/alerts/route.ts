import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, requirePermission, enforceScope, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/alerts
 */
export async function GET(request: Request) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status') || 'active';
    const severity = searchParams.get('severity');
    const cursor = searchParams.get('cursor');
    const limitParams = searchParams.get('limit');
    const limit = limitParams ? Math.min(parseInt(limitParams), 50) : 20;

    // ABAC: Alertas globales O de mi territorio
    const scopeFilter = await enforceScope(session, { isMany: true, logic: 'OR', relationName: 'territories' });

    const where: any = {
      status,
      ...scopeFilter
    };

    if (severity) where.severity = severity;

    const alerts = await prisma.alert.findMany({
      where,
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      include: {
        territories: { include: { territory: { select: { name: true } } } },
        reads: { where: { userId: session.sub } }
      },
      orderBy: { createdAt: 'desc' }
    });

    let nextCursor = null;
    if (alerts.length > limit) {
      const nextItem = alerts.pop();
      nextCursor = nextItem?.id;
    }

    const mapped = alerts.map(a => ({
      ...a,
      isRead: a.reads.length > 0,
      territoryNames: a.territories.map(t => t.territory.name).join(', ') || 'Global'
    }));

    return NextResponse.json({ items: mapped, nextCursor }, { headers: { 'Cache-Control': 'no-store' } });

  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/alerts
 */
export async function POST(request: Request) {
  try {
    const session = await requirePermission('posts:create');
    const body = await request.json();

    const scopeFilter = await enforceScope(session, { isMany: true, relationName: 'territories' });

    // Si no es SuperAdmin, validar que los territorios solicitados estén en su alcance
    let finalTerritoryIds = body.territoryIds || [];

    if (session.role !== 'SuperAdminNacional') {
      const accessibleTerritories = await prisma.territory.findMany({
        where: {
          id: { in: finalTerritoryIds.length > 0 ? finalTerritoryIds : [session.territoryId] },
          // Aplicar el mismo filtro que enforceScope genera para territorios si fuera necesario
          // Pero aquí es más simple: si session.territoryId existe, debe ser ese o descendiente.
          // Usaremos una validación rápida:
          OR: [
            { id: session.territoryId },
            { parentId: session.territoryId } // Un nivel abajo por ahora, o usar la lógica de enforceScope
          ]
        },
        select: { id: true }
      });
      finalTerritoryIds = accessibleTerritories.map(t => t.id);

      // Si no se encontró nada o no envió nada, forzar su propio territorio
      if (finalTerritoryIds.length === 0 && session.territoryId) {
        finalTerritoryIds = [session.territoryId];
      }
    }

    const alertArr = await prisma.alert.create({
      data: {
        title: body.title,
        message: body.message,
        type: body.type || 'info',
        severity: body.severity || 'medium',
        status: 'active',
        territories: {
          create: finalTerritoryIds.map((tid: string) => ({
            territoryId: tid
          }))
        }
      }
    });

    logAudit("ALERT_CREATED", "Alert", alertArr.id, session.sub, { title: body.title, scope: finalTerritoryIds });

    return NextResponse.json(alertArr, { status: 201 });

  } catch (error) {
    return handleApiError(error);
  }
}
