import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, enforceScope, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';

/**
 * GET /api/incidents
 */
export async function GET(request: Request) {
  try {
    const session = await requirePermission('incidents:view');
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const limit = searchParams.get('limit');

    // ABAC M-M
    const scopeFilter = await enforceScope(session, { isMany: true, relationName: 'territories' });
    const where: any = { ...scopeFilter };

    if (status) where.status = status;
    if (category) where.category = category;
    if (priority) where.priority = priority;

    const incidents = await prisma.incident.findMany({
      where,
      include: {
        reportedBy: { select: { name: true, email: true } },
        assignedTo: { select: { name: true, email: true } },
        territories: { include: { territory: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : undefined
    });

    const mapped = incidents.map(inc => ({
      ...inc,
      territoryNames: inc.territories.map(t => t.territory.name).join(', ') || 'Global'
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/incidents
 */
export async function POST(request: Request) {
  try {
    const session = await requirePermission('incidents:create');
    const body = await request.json();

    if (!body.title || !body.category) {
      return NextResponse.json({ error: "Faltan datos obligatorios (title, category)" }, { status: 400 });
    }

    const { territoryIds, ...rest } = body;

    const incident = await prisma.incident.create({
      data: {
        title: rest.title,
        description: rest.description,
        category: rest.category,
        priority: rest.priority || 'MEDIUM',
        status: 'PENDING',
        latitude: rest.latitude,
        longitude: rest.longitude,
        address: rest.address,
        photoUrl: rest.photoUrl,
        reportedById: session.sub,
        territories: {
          create: (territoryIds || []).map((tid: string) => ({
            territoryId: tid
          }))
        }
      }
    });

    logAudit("ALERT_CREATED", "Incident", incident.id, session.sub, { title: incident.title });

    return NextResponse.json(incident, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
