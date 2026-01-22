import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, handleApiError } from "@/lib/guard";

// GET: Admin view for read receipts (who read the post)
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requirePermission('posts:manage');
        const { id } = params;

        const reads = await prisma.postRead.findMany({
            where: { postId: id },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        role: true,
                        territory: { select: { name: true } }
                    }
                }
            },
            orderBy: { readAt: 'desc' }
        });

        return NextResponse.json(reads);
    } catch (error) {
        return handleApiError(error);
    }
}
