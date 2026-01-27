import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, enforceScope, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/alerts/:id/read
 * Marca una alerta como leída por el usuario actual.
 */
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requireAuth();
        const { id: alertId } = params;

        const scopeFilter = await enforceScope(session, { isMany: true, logic: 'OR', relationName: 'territories' });

        const existing = await prisma.alert.findFirst({
            where: { id: alertId, ...scopeFilter }
        });

        if (!existing) {
            return NextResponse.json({ error: "Alerta no encontrada o fuera de alcance" }, { status: 404 });
        }

        // Upsert para evitar errores de duplicado si se clickea varias veces
        await prisma.alertRead.upsert({
            where: {
                alertId_userId: {
                    alertId,
                    userId: session.sub
                }
            },
            create: {
                alertId,
                userId: session.sub
            },
            update: {
                readAt: new Date()
            }
        });

        logAudit("ALERT_READ", "Alert", alertId, session.sub);

        return NextResponse.json({ success: true });

    } catch (error) {
        return handleApiError(error);
    }
}
