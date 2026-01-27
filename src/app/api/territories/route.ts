import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, handleApiError } from "@/lib/guard";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
    try {
        await requirePermission('territory:view');

        const territories = await prisma.territory.findMany({
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(territories);
    } catch (error) {
        return handleApiError(error);
    }
}
