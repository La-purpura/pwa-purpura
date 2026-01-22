import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requirePermission, handleApiError } from "@/lib/guard";

const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        const session = await requirePermission('forms:view'); // Permiso básico para ver stats

        // Filtros de Scope (si corresponde)
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
            prisma.alert.count({ where: { isRead: false } }) // Alertas globales por ahora
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
