
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, enforceScope, handleApiError } from "@/lib/guard";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/sync/pull
 * Gets delta changes since a specific timestamp.
 */
export async function GET(request: Request) {
    try {
        const session = await requireAuth();
        const { searchParams } = new URL(request.url);
        const sinceStr = searchParams.get('since');

        if (!sinceStr) {
            return NextResponse.json({ error: "Parámetro 'since' es requerido" }, { status: 400 });
        }

        const since = new Date(sinceStr);
        const scopeFilter = await enforceScope(session, {
            isMany: true,
            relationName: 'territories',
            logic: 'OR'
        });

        const [tasks, projects, reports, alerts, posts] = await Promise.all([
            prisma.task.findMany({
                where: { ...scopeFilter, updatedAt: { gt: since } },
                include: { assignee: { select: { name: true, id: true } } }
            }),
            prisma.project.findMany({
                where: { ...scopeFilter, updatedAt: { gt: since } },
                include: { leader: { select: { name: true, id: true } } }
            }),
            prisma.report.findMany({
                where: { ...scopeFilter, updatedAt: { gt: since } }
            }),
            prisma.alert.findMany({
                where: { ...scopeFilter, updatedAt: { gt: since } }
            }),
            prisma.post.findMany({
                where: {
                    OR: [
                        { ...scopeFilter },
                        { branchId: session.branchId || undefined }
                    ],
                    updatedAt: { gt: since }
                }
            })
        ]);

        return NextResponse.json({
            tasks,
            projects,
            reports,
            alerts,
            posts,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        return handleApiError(error);
    }
}
