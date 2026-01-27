import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, enforceScope, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/requests/:id
 */
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requirePermission('forms:view');
        const { id } = params;

        const scopeFilter = await enforceScope(session);

        const req = await prisma.request.findFirst({
            where: {
                id,
                ...scopeFilter
            },
            include: {
                submittedBy: { select: { id: true, name: true, email: true } },
                territory: { select: { id: true, name: true } }
            }
        });

        if (!req) return NextResponse.json({ error: "No encontrada o sin acceso" }, { status: 404 });

        return NextResponse.json(req);
    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * PATCH /api/requests/:id
 */
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requirePermission('forms:create');
        const { id } = params;
        const body = await request.json();

        const scopeFilter = await enforceScope(session);

        const existing = await prisma.request.findFirst({
            where: {
                id,
                ...scopeFilter
            }
        });

        if (!existing) return NextResponse.json({ error: "No encontrada o sin acceso" }, { status: 404 });
        if (existing.status !== 'pending') return NextResponse.json({ error: "Solo se editan pendientes" }, { status: 400 });
        if (existing.submittedById !== session.sub && session.role !== 'SuperAdminNacional') {
            return NextResponse.json({ error: "No autorizado" }, { status: 403 });
        }

        const updated = await prisma.request.update({
            where: { id },
            data: {
                type: body.type,
                data: typeof body.data === 'string' ? body.data : JSON.stringify(body.data),
                feedback: body.feedback
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * DELETE /api/requests/:id
 */
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requirePermission('forms:create');
        const { id } = params;

        const scopeFilter = await enforceScope(session);

        const existing = await prisma.request.findFirst({
            where: { id, ...scopeFilter }
        });

        if (!existing) return NextResponse.json({ error: "No encontrada o sin acceso" }, { status: 404 });

        await prisma.request.delete({ where: { id } });
        logAudit("REQUEST_DELETED", "Request", id, session.sub, { note: "Request deleted physically" });

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleApiError(error);
    }
}
