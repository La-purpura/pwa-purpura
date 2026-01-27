import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, enforceScope, handleApiError } from "@/lib/guard";
import { subDays, format, startOfDay } from "date-fns";
import { es } from "date-fns/locale";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
    try {
        const session = await requirePermission('territory:view');

        // 1. Get scopes
        const reportScope = await enforceScope(session, { isMany: true, relationName: 'territories' });
        const taskScope = await enforceScope(session, { isMany: true, relationName: 'territories' });

        // 2. Weekly Activity (Last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i)).reverse();

        const activityPromises = last7Days.map(async (date) => {
            const start = startOfDay(date);
            const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

            const [tasks, reports] = await Promise.all([
                prisma.task.count({
                    where: {
                        ...taskScope,
                        createdAt: { gte: start, lt: end }
                    }
                }),
                prisma.report.count({
                    where: {
                        ...reportScope,
                        createdAt: { gte: start, lt: end }
                    }
                })
            ]);

            return {
                name: format(date, 'eee', { locale: es }),
                tasks,
                reports
            };
        });

        // 3. Category Distribution
        const reportsByCategory = await prisma.report.groupBy({
            by: ['category'],
            where: reportScope,
            _count: true
        });

        const distribution = reportsByCategory.map(item => ({
            name: item.category,
            value: item._count
        }));

        const activity = await Promise.all(activityPromises);

        return NextResponse.json({
            activity,
            distribution,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        return handleApiError(error);
    }
}
