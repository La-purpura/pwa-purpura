import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requirePermission, handleApiError } from "@/lib/guard";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        // Mínimo permiso de vista
        await requirePermission('territory:view');

        const territories = await prisma.territory.findMany({
            orderBy: { name: 'asc' } // Orden alfabético
        });

        return NextResponse.json(territories);
    } catch (error) {
        return handleApiError(error);
    }
}
