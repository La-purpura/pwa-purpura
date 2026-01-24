import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, enforceScope, handleApiError } from "@/lib/guard";
import { subDays, format, startOfOfDay } from "date-fns";
import { es } from "date-fns/locale";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
    try {
        const session = await requireAuth();

        // 1. Get scopes
        const incidentScope = await enforceScope(session, { isMany: true, relationName: 'territories' });
        const taskScope = await enforceScope(session, { isMany: true, relationName: 'territories' });

        // 2. Weekly Activity (Last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i)).reverse();

        const activityPromises = last7Days.map(async (date) => {
            const start = startOfOfDay(date);
            const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

            const [tasks, incidents] = await Promise.all([
                prisma.task.count({
                    where: {
                        ...taskScope,
                        createdAt: { gte: start, lt: end }
                    }
                }),
                prisma.incident.count({
                    where: {
                        ...incidentScope,
                        createdAt: { gte: start, lt: end }
                    }
                })
            ]);

            return {
                name: format(date, 'eee', { locale: es }),
                tasks,
                incidents
            };
        });

        // 3. Category Distribution
        const incidentsByCategory = await prisma.incident.groupBy({
            by: ['category'],
            where: incidentScope,
            _count: true
        });

        const distribution = incidentsByCategory.map(item => ({
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
