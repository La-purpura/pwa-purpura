import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const session = await requirePermission('forms:view');

        const where: any = {};
        if (session.territoryId) {
            where.territoryId = session.territoryId;
        }

        const requests = await prisma.request.findMany({
            where,
            include: {
                submittedBy: { select: { name: true, email: true } },
                territory: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(requests);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: Request) {
    try {
        const session = await requirePermission('forms:create');
        const body = await request.json();

        if (!body.type || !body.data) {
            return NextResponse.json({ error: "Faltan datos (type, data)" }, { status: 400 });
        }

        const newRequest = await prisma.request.create({
            data: {
                type: body.type,
                data: JSON.stringify(body.data),
                status: "pending",
                submittedById: session.sub,
                territoryId: session.territoryId || body.territoryId || null
            }
        });

        logAudit("REQUEST_SUBMITTED", "Request", newRequest.id, session.sub, { type: body.type });

        return NextResponse.json(newRequest, { status: 201 });
    } catch (error) {
        return handleApiError(error);
    }
}
