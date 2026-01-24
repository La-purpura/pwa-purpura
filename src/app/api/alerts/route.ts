import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, requirePermission, enforceScope, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';

/**
 * GET /api/alerts
 */
export async function GET(request: Request) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status') || 'active';
    const severity = searchParams.get('severity');

    // ABAC: Alertas globales O de mi territorio
    const scopeFilter = await enforceScope(session, { isMany: true, logic: 'OR' });

    const where: any = {
      status,
      ...scopeFilter
    };

    if (severity) where.severity = severity;

    const alerts = await prisma.alert.findMany({
      where,
      include: {
        territories: { include: { territory: { select: { name: true } } } },
        reads: { where: { userId: session.sub } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const mapped = alerts.map(a => ({
      ...a,
      isRead: a.reads.length > 0,
      territoryNames: a.territories.map(t => t.territory.name).join(', ') || 'Global'
    }));

    return NextResponse.json(mapped, { headers: { 'Cache-Control': 'no-store' } });

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

    const alertArr = await prisma.alert.create({
      data: {
        title: body.title,
        message: body.message,
        type: body.type || 'info',
        severity: body.severity || 'medium',
        territories: {
          create: (body.territoryIds || []).map((tid: string) => ({
            territoryId: tid
          }))
        }
      }
    });

    logAudit("ALERT_CREATED", "Alert", alertArr.id, session.sub, { title: body.title });

    return NextResponse.json(alertArr, { status: 201 });

  } catch (error) {
    return handleApiError(error);
  }
}
