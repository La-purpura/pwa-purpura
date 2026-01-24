import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, handleApiError } from "@/lib/guard";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const session = await requirePermission('forms:view');

        const whereTasks: any = {};
        const whereUsers: any = {};

        if (session.territoryId) {
            whereTasks.territoryId = session.territoryId;
            whereUsers.territoryId = session.territoryId;
        }

        const [tasksCount, usersCount, pendingTasks, alertsCount] = await Promise.all([
            prisma.task.count({ where: whereTasks }),
            prisma.user.count({ where: whereUsers }),
            prisma.task.count({ where: { ...whereTasks, status: 'pending' } }),
            prisma.alert.count({ where: { status: 'active' } as any })
        ]);

        return NextResponse.json({
            totalTasks: tasksCount,
            pendingTasks,
            totalUsers: usersCount,
            activeAlerts: alertsCount,
            generatedAt: new Date().toISOString()
        });
    } catch (error) {
        return handleApiError(error);
    }
}
