import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';

// GET: List incidents with filters
export async function GET(request: Request) {
  try {
    const session = await requirePermission('incidents:view');
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const limit = searchParams.get('limit');

    const where: any = {};

    // Scope by territory if user is not admin
    if (session.territoryId) {
      where.territoryId = session.territoryId;
    }

    if (status) where.status = status;
    if (category) where.category = category;
    if (priority) where.priority = priority;

    const incidents = await prisma.incident.findMany({
      where,
      include: {
        reportedBy: {
          select: { name: true, email: true }
        },
        assignedTo: {
          select: { name: true, email: true }
        },
        territory: {
          select: { name: true }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit ? parseInt(limit) : undefined
    });

    return NextResponse.json(incidents);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST: Create new incident
export async function POST(request: Request) {
  try {
    const session = await requirePermission('incidents:create');
    const body = await request.json();

    if (!body.title || !body.category) {
      return NextResponse.json({ error: "Faltan datos obligatorios (title, category)" }, { status: 400 });
    }

    const incident = await prisma.incident.create({
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        priority: body.priority || 'MEDIUM',
        status: 'PENDING',
        latitude: body.latitude,
        longitude: body.longitude,
        address: body.address,
        photoUrl: body.photoUrl,
        reportedById: session.sub,
        territoryId: session.territoryId || body.territoryId
      }
    });

    logAudit("ALERT_CREATED", "Incident", incident.id, session.sub, {
      title: incident.title,
      category: incident.category,
      priority: incident.priority
    });

    return NextResponse.json(incident, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
