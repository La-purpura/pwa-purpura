import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, enforceScope, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';

/**
 * GET /api/requests
 * Lista solicitudes con filtros de alcance ABAC.
 */
export async function GET(request: Request) {
    try {
        const session = await requirePermission('forms:view');

        const scopeFilter = await enforceScope(session);
        const where: any = { ...scopeFilter };

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

/**
 * POST /api/requests
 * Crea una nueva solicitud o informe.
 */
export async function POST(request: Request) {
    try {
        const session = await requirePermission('forms:create');
        const body = await request.json();

        const { type, data, territoryId } = body;

        if (!type || !data) {
            return NextResponse.json({ error: "Faltan datos obligatorios (type, data)" }, { status: 400 });
        }

        // Valida territorio (si no es nacional, usa el suyo)
        let finalTerritoryId = territoryId;
        if (session.role !== 'SuperAdminNacional' && session.territoryId) {
            finalTerritoryId = session.territoryId;
        }

        const newRequest = await prisma.request.create({
            data: {
                type,
                data: typeof data === 'string' ? data : JSON.stringify(data),
                status: "pending",
                submittedById: session.sub,
                territoryId: finalTerritoryId || null
            }
        });

        logAudit("REQUEST_CREATED", "Request", newRequest.id, session.sub, { type });

        return NextResponse.json(newRequest, { status: 201 });
    } catch (error) {
        return handleApiError(error);
    }
}
