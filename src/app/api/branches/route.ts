import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, handleApiError } from "@/lib/guard";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        await requireAuth();

        const branches = await prisma.branch.findMany({
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(branches);
    } catch (error) {
        return handleApiError(error);
    }
}
