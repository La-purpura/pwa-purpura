import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, handleApiError } from "@/lib/guard";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await requireAuth();

    const alerts = await prisma.alert.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return NextResponse.json(alerts);
  } catch (error) {
    return handleApiError(error);
  }
}
