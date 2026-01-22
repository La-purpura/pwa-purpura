import { NextResponse } from 'next/server';
import { db } from '@/lib/server-db';

export async function GET() {
    const projects = db.projects.getAll();
    return NextResponse.json(projects);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validación básica
        if (!body.title) {
            return NextResponse.json({ error: 'Título requerido' }, { status: 400 });
        }

        const newProject = db.projects.create({
            code: body.code || `PT-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
            title: body.title,
            branch: body.branch || 'General',
            type: body.type || 'Operativo',
            priority: body.priority || 'medium',
            status: body.status || 'draft',

            territoryLevel: body.territoryLevel || 'locality',
            territories: body.territories || [],
            headquarterTerritory: body.headquarterTerritory || 'Desconocido',

            description: body.description || '',
            generalObjective: body.generalObjective,
            startDate: body.startDate,
            endDate: body.endDate,

            kpis: body.kpis || [],

            leaderId: body.createdBy || 'system',
            teamIds: body.teamIds || [],

            milestones: body.milestones || [],
            risks: body.risks || [],

            createdBy: body.createdBy || 'system',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        return NextResponse.json(newProject);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const updated = db.projects.update(id, {
            ...updates,
            updatedAt: new Date().toISOString()
        });

        if (!updated) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}
