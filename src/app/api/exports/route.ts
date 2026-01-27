
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, enforceScope, handleApiError } from "@/lib/guard";
import { generateCsv } from "@/lib/exports";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/exports
 * Query params: type=tasks|projects|reports|alerts, format=csv
 */
export async function GET(request: Request) {
    try {
        const session = await requirePermission('reports:view');
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const format = searchParams.get('format') || 'csv';

        if (!type || !['tasks', 'projects', 'reports', 'alerts'].includes(type)) {
            return NextResponse.json({ error: "Tipo de exportación inválido" }, { status: 400 });
        }

        // Common Scope
        // Note: For tasks/alerts/reports, relation is 'territories'. For projects too.
        // We enforce scope heavily here.
        const scopeFilter = await enforceScope(session, { isMany: true, relationName: 'territories', logic: 'OR' });

        // Enhance scope filter for reports/incidents which uses `Report` model
        // Actually relationName for Report is 'territories' (ReportTerritory).
        // For Alert: 'territories' (AlertTerritory).
        // For Project: 'territories' (ProjectTerritory).
        // For Task: 'territories' (TaskTerritory).
        // Ideally enforceScope works if the relation name matches.

        let data: any[] = [];
        let fields: string[] = [];

        if (type === 'tasks') {
            data = await prisma.task.findMany({
                where: { ...scopeFilter },
                include: {
                    assignee: { select: { name: true, email: true } },
                    territories: { include: { territory: { select: { name: true } } } }
                },
                orderBy: { createdAt: 'desc' },
                take: 1000 // Limit for safety
            });

            // Flatten
            data = data.map(t => ({
                ID: t.id,
                Titulo: t.title,
                Estado: t.status,
                Prioridad: t.priority,
                Asignado_A: t.assignee?.name || 'Sin asignar',
                Territorios: t.territories.map((rt: any) => rt.territory.name).join(', '),
                Fecha_Creacion: t.createdAt.toISOString(),
                Fecha_Vencimiento: t.dueDate?.toISOString() || ''
            }));
            fields = ['ID', 'Titulo', 'Estado', 'Prioridad', 'Asignado_A', 'Territorios', 'Fecha_Creacion', 'Fecha_Vencimiento'];
        }

        if (type === 'projects') {
            data = await prisma.project.findMany({
                where: { ...scopeFilter },
                include: {
                    leader: { select: { name: true } },
                    territories: { include: { territory: { select: { name: true } } } }
                },
                orderBy: { createdAt: 'desc' },
                take: 1000
            });

            data = data.map(p => ({
                ID: p.id,
                Codigo: p.code || '',
                Titulo: p.title,
                Estado: p.status,
                Lider: p.leader?.name || '',
                Territorios: p.territories.map((rt: any) => rt.territory.name).join(', '),
                Fecha_Creacion: p.createdAt.toISOString()
            }));
            fields = ['ID', 'Codigo', 'Titulo', 'Estado', 'Lider', 'Territorios', 'Fecha_Creacion'];
        }

        if (type === 'reports') {
            data = await prisma.report.findMany({
                where: { ...scopeFilter },
                include: {
                    reportedBy: { select: { name: true } },
                    territories: { include: { territory: { select: { name: true } } } }
                },
                orderBy: { createdAt: 'desc' },
                take: 1000
            });

            data = data.map(r => ({
                ID: r.id,
                Titulo: r.title,
                Categoria: r.category,
                Estado: r.status,
                Reportado_Por: r.reportedBy.name,
                Territorios: r.territories.map((rt: any) => rt.territory.name).join(', '),
                Ubicacion: r.latitude ? `${r.latitude}, ${r.longitude}` : '',
                Fecha: r.createdAt.toISOString()
            }));
            fields = ['ID', 'Titulo', 'Categoria', 'Estado', 'Reportado_Por', 'Territorios', 'Ubicacion', 'Fecha'];
        }

        if (type === 'alerts') {
            // Alerts might be global or territorial.
            // If enforceScope returns filter, apply it.
            data = await prisma.alert.findMany({
                where: { ...scopeFilter },
                include: {
                    territories: { include: { territory: { select: { name: true } } } }
                },
                orderBy: { createdAt: 'desc' },
                take: 1000
            });

            data = data.map(a => ({
                ID: a.id,
                Titulo: a.title,
                Mensaje: a.message,
                Tipo: a.type,
                Severidad: a.severity,
                Territorios: a.territories.map((rt: any) => rt.territory.name).join(', ') || 'Global',
                Fecha: a.createdAt.toISOString()
            }));
            fields = ['ID', 'Titulo', 'Mensaje', 'Tipo', 'Severidad', 'Territorios', 'Fecha'];
        }

        if (format === 'csv') {
            const csv = generateCsv(data, fields);

            logAudit("EXPORT_GENERATED", "System", "N/A", session.sub, { type, count: data.length });

            return new NextResponse(csv, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="${type}-${new Date().toISOString().split('T')[0]}.csv"`
                }
            });
        }

        return NextResponse.json({ error: "Formato no soportado" }, { status: 400 });

    } catch (error) {
        return handleApiError(error);
    }
}
