import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, enforceScope, handleApiError, applySecurityHeaders } from "@/lib/guard";
import { logAudit } from "@/lib/audit";
import { ReportSchema } from "@/lib/schemas";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/incidents
 * Lista incidencias/reportes con filtros de alcance.
 */
export async function GET(request: Request) {
  try {
    const session = await requirePermission('reports:view');
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const query = searchParams.get('q');
    const cursor = searchParams.get('cursor');
    const limitParams = searchParams.get('limit');
    const limit = limitParams ? Math.min(parseInt(limitParams), 50) : 20;

    const scopeFilter = await enforceScope(session, { isMany: true, relationName: 'territories' });
    const where: any = { ...scopeFilter };

    if (status) where.status = status;
    if (category) where.category = category;
    if (priority) where.priority = priority;

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { address: { contains: query, mode: 'insensitive' } }
      ];
    }

    const reports = await prisma.report.findMany({
      where,
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      include: {
        reportedBy: { select: { name: true, alias: true, email: true } },
        assignedTo: { select: { name: true, alias: true, email: true } },
        territories: { include: { territory: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    let nextCursor = null;
    if (reports.length > limit) {
      const nextItem = reports.pop();
      nextCursor = nextItem?.id;
    }

    const mapped = reports.map(rep => ({
      ...rep,
      territoryNames: rep.territories.map(t => t.territory.name).join(', ') || 'Global'
    }));

    const response = NextResponse.json({ items: mapped, nextCursor });
    return applySecurityHeaders(response);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/incidents
 * Crea una nueva incidencia.
 */
export async function POST(request: Request) {
  try {
    const session = await requirePermission('reports:create');
    const body = await request.json();

    const result = ReportSchema.safeParse(body);
    if (!result.success) {
      return handleApiError(result.error);
    }

    const { territoryIds, ...rest } = result.data;

    const report = await prisma.report.create({
      data: {
        title: rest.title,
        description: rest.description,
        category: rest.category,
        priority: rest.priority || 'MEDIUM',
        status: 'PENDING',
        latitude: rest.latitude,
        longitude: rest.longitude,
        address: rest.address,
        reportedById: session.sub,
        territories: {
          create: (territoryIds || []).map((tid: string) => ({
            territoryId: tid
          }))
        }
      }
    });

    logAudit("REPORT_CREATED", "Report", report.id, session.sub, { title: report.title });

    const response = NextResponse.json(report, { status: 201 });
    return applySecurityHeaders(response);
  } catch (error) {
    return handleApiError(error);
  }
}
