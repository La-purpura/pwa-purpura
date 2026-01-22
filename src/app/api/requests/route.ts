import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requirePermission, handleApiError } from "@/lib/guard";

const prisma = new PrismaClient();

// GET: List requests with ABAC/RBAC filtering
export async function GET(request: Request) {
    try {
        const session = await requirePermission('forms:view');

        const where: any = {};

        // ABAC Level: Territorial Scope
        if (session.territoryId) {
            // If user has a territoryId, they only see requests from their territory or sub-territories
            // For now, simple direct match or sub-territory check (if implemented in guard, it returns territoryId)
            where.territoryId = session.territoryId;
        }

        const requests = await prisma.request.findMany({
            where,
            include: {
                submittedBy: {
                    select: { name: true, email: true, role: true }
                },
                territory: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(requests);
    } catch (error) {
        return handleApiError(error);
    }
}

// POST: Create a new request
export async function POST(request: Request) {
    try {
        const session = await requirePermission('forms:create');
        const body = await request.json();

        const newRequest = await prisma.request.create({
            data: {
                type: body.type || "Relevamiento Genérico",
                data: typeof body.data === 'string' ? body.data : JSON.stringify(body.data || {}),
                status: "pending",
                submittedById: session.userId,
                territoryId: body.territoryId || session.territoryId, // Prefers provided or fallback to user scope
            },
            include: {
                submittedBy: {
                    select: { name: true, email: true }
                }
            }
        });

        // Auditoría
        await prisma.auditLog.create({
            data: {
                action: 'REQUEST_CREATED',
                entity: 'Request',
                entityId: newRequest.id,
                actorId: session.userId,
                metadata: JSON.stringify({ type: newRequest.type })
            }
        });

        return NextResponse.json(newRequest, { status: 201 });
    } catch (error) {
        return handleApiError(error);
    }
}
