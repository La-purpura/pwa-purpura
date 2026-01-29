
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, enforceScope, handleApiError } from "@/lib/guard";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/sync/bootstrap
 * Gets the initial payload for offline use based on user scope.
 */
export async function GET(request: Request) {
    try {
        const session = await requireAuth();

        // Use OR logic for territories as default for sync
        const scopeFilter = await enforceScope(session, {
            isMany: true,
            relationName: 'territories',
            logic: 'OR'
        });

        // Parallel fetch of all relevant entities
        const [tasks, projects, alerts, reports, posts] = await Promise.all([
            prisma.task.findMany({
                where: { ...scopeFilter },
                include: { assignee: { select: { name: true, id: true } } },
                take: 200,
                orderBy: { updatedAt: 'desc' }
            }),
            prisma.project.findMany({
                where: { ...scopeFilter },
                include: { leader: { select: { name: true, id: true } } },
                take: 100,
                orderBy: { updatedAt: 'desc' }
            }),
            prisma.alert.findMany({
                where: { ...scopeFilter },
                take: 50,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.report.findMany({
                where: { ...scopeFilter },
                take: 100,
                orderBy: { updatedAt: 'desc' }
            }),
            prisma.post.findMany({
                where: {
                    OR: [
                        { ...scopeFilter },
                        { branchId: session.branchId || undefined }
                    ]
                },
                take: 50,
                orderBy: { publishedAt: 'desc' }
            })
        ]);

        return NextResponse.json({
            tasks,
            projects,
            alerts,
            reports,
            posts,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        return handleApiError(error);
    }
}
