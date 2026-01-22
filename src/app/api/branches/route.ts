import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireAuth, handleApiError } from "@/lib/guard";

const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        await requireAuth(); // No especificamos permiso estricto, es metadata pública interna

        const branches = await prisma.branch.findMany({
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(branches);
    } catch (error) {
        return handleApiError(error);
    }
}
