import { NextResponse } from "next/server";
import { db, DbRequest } from "@/lib/server-db";

// GET: Admin ve las solicitudes pendientes
export async function GET(request: Request) {
    return NextResponse.json(db.requests.getAll());
}

// POST: App envía un relevamiento completado
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const newRequest = db.requests.create({
            type: body.type || "Relevamiento Genérico",
            data: body.data || {},
            submittedBy: body.userId || "anon",
            status: "pending",
            territory: body.territory || "Desconocido",
            createdAt: new Date().toISOString()
        });

        return NextResponse.json(newRequest, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Error al procesar solicitud" }, { status: 500 });
    }
}

// PUT: Admin aprueba/rechaza
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, status, feedback } = body;

        const updatedRequest = db.requests.update(id, {
            status,
            feedback
        });

        if (!updatedRequest) {
            return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
        }

        return NextResponse.json(updatedRequest);
    } catch (error) {
        return NextResponse.json({ error: "Error de actualización" }, { status: 500 });
    }
}
