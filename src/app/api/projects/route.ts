import { NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";
import { requirePermission, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        const session = await requirePermission('projects:view');

        const projects = await prisma.project.findMany({
            include: {
                milestones: true,
                kpis: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Adaptador para el frontend (Flattening si es necesario, o pasar directo)
        return NextResponse.json(projects);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: Request) {
    try {
        const session = await requirePermission('projects:create');
        const body = await request.json();

        // Validaciones
        if (!body.title) return NextResponse.json({ error: 'Título requerido' }, { status: 400 });

        const newProject = await prisma.project.create({
            data: {
                code: body.code || `PROJ-${Date.now().toString().slice(-6)}`,
                title: body.title,
                branch: body.branch || 'General',
                type: body.type,
                priority: body.priority || 'medium',
                status: 'draft',
                description: body.description,

                leaderId: session.sub, // Asignamos al creador como líder

                // Crear dependencias anidadas
                kpis: {
                    create: (body.kpis || []).map((k: any) => ({
                        name: k.name,
                        target: Number(k.target) || 100,
                        unit: k.unit || 'unidades'
                    }))
                },
                milestones: {
                    create: (body.milestones || []).map((m: any) => ({
                        name: m.name,
                        status: 'pending',
                        endDate: m.endDate ? new Date(m.endDate) : undefined
                    }))
                },
                risks: {
                    create: (body.risks || []).map((r: any) => ({
                        description: r.description,
                        probability: Number(r.probability) || 1,
                        impact: Number(r.impact) || 1
                    }))
                }
            },
            include: {
                milestones: true,
                kpis: true,
                risks: true
            }
        });

        logAudit("PROJECT_CREATED", "Project", newProject.id, session.sub, { title: newProject.title });

        return NextResponse.json(newProject);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function PUT(request: Request) {
    try {
        const session = await requirePermission('projects:manage');
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        // En M2 simple, actualizamos campos escalares base
        // updateMany/nested para kpis es complejo, lo dejamos simple updates por ahora.
        const updated = await prisma.project.update({
            where: { id },
            data: {
                status: updates.status,
                priority: updates.priority
                // Añadir más campos según necesidad
            }
        });

        logAudit("PROJECT_APPROVED", "Project", id, session.sub, { updates }); // Generic audit

        return NextResponse.json(updated);
    } catch (error) {
        return handleApiError(error);
    }
}
