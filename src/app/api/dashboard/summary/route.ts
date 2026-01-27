import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, enforceScope, handleApiError } from "@/lib/guard";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
    try {
        const session = await requireAuth();

        // 1. Obtener filtros de alcance territorial (M-M)
        const taskScope = await enforceScope(session, { isMany: true, relationName: 'territories' });
        const incidentScope = await enforceScope(session, { isMany: true, relationName: 'territories' });
        const alertScope = await enforceScope(session, { isMany: true, relationName: 'territories' });
        const projectScope = await enforceScope(session, { isMany: true, relationName: 'territories' });
        const requestScope = await enforceScope(session);

        // 2. Ejecutar agregaciones en paralelo
        const [
            tasksCount,
            projectsCount,
            incidentsCount,
            alertsActive,
            alertsUnread,
            requestsPending,
            activeUsers
        ] = await Promise.all([
            // Tasks by Status
            prisma.task.groupBy({
                by: ['status'],
                where: taskScope,
                _count: true
            }),
            // Projects by Status
            prisma.project.groupBy({
                by: ['status'],
                where: projectScope,
                _count: true
            }),
            // Incidents by Status
            prisma.report.groupBy({
                by: ['status'],
                where: incidentScope,
                _count: true
            }),
            // Active Alerts
            prisma.alert.count({
                where: { ...alertScope, status: 'active' }
            }),
            // Unread Alerts
            prisma.alert.count({
                where: {
                    ...alertScope,
                    status: 'active',
                    reads: {
                        none: { userId: session.sub }
                    }
                }
            }),
            // Pending Requests
            prisma.request.count({
                where: { ...requestScope, status: 'pending' }
            }),
            // Active Users
            prisma.user.count({
                where: { ...requestScope, status: 'ACTIVE' }
            })
        ]);

        const totalTasks = tasksCount.reduce((acc, curr) => acc + curr._count, 0);
        const pendingTasks = tasksCount.find(t => t.status === 'pending')?._count || 0;

        // 3. Formatear resultados
        return NextResponse.json({
            tasks: {
                total: totalTasks,
                pending: pendingTasks,
                byStatus: tasksCount.reduce((acc: any, curr: any) => ({ ...acc, [curr.status]: curr._count }), {})
            },
            projects: {
                total: projectsCount.reduce((acc: number, curr: any) => acc + curr._count, 0),
                byStatus: projectsCount.reduce((acc: any, curr: any) => ({ ...acc, [curr.status]: curr._count }), {})
            },
            incidents: {
                total: incidentsCount.reduce((acc: number, curr: any) => acc + curr._count, 0),
                byStatus: incidentsCount.reduce((acc: any, curr: any) => ({ ...acc, [curr.status]: curr._count }), {})
            },
            alerts: {
                active: alertsActive,
                unread: alertsUnread
            },
            requests: {
                pending: requestsPending
            },
            users: {
                total: activeUsers,
                active: activeUsers
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        return handleApiError(error);
    }
}
