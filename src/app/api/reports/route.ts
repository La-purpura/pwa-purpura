import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, enforceScope, handleApiError, applySecurityHeaders } from "@/lib/guard";
import { logAudit } from "@/lib/audit";
import { ReportSchema } from "@/lib/schemas";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/reports
 */
export async function GET(request: Request) {
  try {
    const session = await requirePermission('reports:view');
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const limitParams = searchParams.get('limit');
    const limit = limitParams ? parseInt(limitParams) : undefined;

    const scopeFilter = await enforceScope(session, { isMany: true, relationName: 'territories' });
    const where: any = { ...scopeFilter };

    if (status) where.status = status;
    if (category) where.category = category;
    if (priority) where.priority = priority;

    const reports = await prisma.report.findMany({
      where,
      include: {
        reportedBy: { select: { name: true, alias: true, email: true } },
        assignedTo: { select: { name: true, alias: true, email: true } },
        territories: { include: { territory: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' },
      take: limit && limit > 0 && limit <= 100 ? limit : 50
    });

    const mapped = reports.map(rep => ({
      ...rep,
      territoryNames: rep.territories.map(t => t.territory.name).join(', ') || 'Global'
    }));

    const response = NextResponse.json(mapped);
    return applySecurityHeaders(response);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/reports
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
