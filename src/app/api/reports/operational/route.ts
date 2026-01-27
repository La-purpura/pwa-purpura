
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, enforceScope, handleApiError, applySecurityHeaders } from "@/lib/guard";
import { getUserEffectiveTerritoryIds } from "@/lib/scopes"; // Need this to iterate territories?
// Actually simpler approach: Group by territory?

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/reports/operational
 * Returns operational metrics: Activity (Tasks/Reports count), Backlog, Activity Ranking by Territory.
 */
export async function GET(request: Request) {
    try {
        const session = await requirePermission('reports:view');

        // Use enforceScope to limit what data we aggregate
        // But for "Ranking", we want to group by Territory.
        // Prisma groupBy is good but doesn't support complex relations easily.
        // We will fetch territories in scope and then calculate metrics for each?
        // Or fetch all data within scope and aggregate in code?
        // Fetching all data might be heavy.
        // Let's use `groupBy` on join tables if possible.
        // Prisma `groupBy` on `TaskTerritory` works to count tasks per territory.

        // 1. Get valid territory IDs
        const scopeFilter = await enforceScope(session, { territory: true });
        // NOTE: enforceScope returns a WHERE clause object. E.g. { OR: [ { territoryId: { in: [...] } } ] } or similar for the main model.
        // But counting per territory involves join tables usually (TaskTerritory).
        // Let's get the list of allowed territory IDs first from `getUserEffectiveTerritoryIds` (or check session if superadmin).

        let allowedIds: string[] = [];
        if (session.role === 'SuperAdminNacional') {
            // All territories
            const all = await prisma.territory.findMany({ select: { id: true } });
            allowedIds = all.map(t => t.id);
        } else {
            const userIds = await getUserEffectiveTerritoryIds(session.sub);
            allowedIds = userIds;
        }

        if (allowedIds.length === 0) {
            return NextResponse.json({ activity: [], ranking: [], backlog: {} });
        }

        // Limit allowedIds to avoid query explosion? 
        // For now assume manageable number (<1000).

        // A. Ranking: Count Tasks + Reports per Territory
        // We can do parallel queries.

        const [taskCounts, reportCounts, territories] = await Promise.all([
            prisma.taskTerritory.groupBy({
                by: ['territoryId'],
                _count: { taskId: true },
                where: { territoryId: { in: allowedIds } }
            }),
            prisma.reportTerritory.groupBy({
                by: ['territoryId'],
                _count: { reportId: true },
                where: { territoryId: { in: allowedIds } }
            }),
            prisma.territory.findMany({
                where: { id: { in: allowedIds } },
                select: { id: true, name: true }
            })
        ]);

        // Merge counts
        // Map: territoryId -> { name, tasks, reports, total }
        const rankingMap: Record<string, any> = {};
        territories.forEach(t => {
            rankingMap[t.id] = { id: t.id, name: t.name, tasks: 0, reports: 0, total: 0 };
        });

        taskCounts.forEach(c => {
            if (rankingMap[c.territoryId]) rankingMap[c.territoryId].tasks = c._count.taskId;
        });
        reportCounts.forEach(c => {
            if (rankingMap[c.territoryId]) rankingMap[c.territoryId].reports = c._count.reportId;
        });

        // Compute Total and Sort
        const ranking = Object.values(rankingMap).map((item: any) => ({
            ...item,
            total: item.tasks + item.reports
        })).sort((a: any, b: any) => b.total - a.total).slice(0, 10); // Top 10

        // B. Weekly Activity (Global for the allowed scope)
        // Last 7 days.
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentTasks = await prisma.task.count({
            where: {
                createdAt: { gte: sevenDaysAgo },
                territories: { some: { territoryId: { in: allowedIds } } }
            }
        });
        const recentReports = await prisma.report.count({
            where: {
                createdAt: { gte: sevenDaysAgo },
                territories: { some: { territoryId: { in: allowedIds } } }
            }
        });

        const weeklyActivity = {
            tasks: recentTasks,
            reports: recentReports
        };

        // C. Backlog (Tasks pending/in-progress)
        const backlogCounts = await prisma.task.groupBy({
            by: ['status'],
            _count: { id: true },
            where: {
                status: { in: ['pending', 'in_progress', 'blocked'] },
                territories: { some: { territoryId: { in: allowedIds } } }
            }
        });

        const backlog = backlogCounts.map(b => ({ status: b.status, count: b._count.id }));

        const response = NextResponse.json({
            ranking,
            weeklyActivity,
            backlog
        });

        return applySecurityHeaders(response, { noStore: true });
    } catch (error) {
        return handleApiError(error);
    }
}
