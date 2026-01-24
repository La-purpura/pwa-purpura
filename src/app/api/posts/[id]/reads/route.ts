import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, handleApiError } from "@/lib/guard";

export const dynamic = 'force-dynamic';

/**
 * GET /api/posts/:id/reads
 * Lista de usuarios que leyeron el post (Solo Admin/Coord).
 */
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await requirePermission('posts:create');
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

        const mapped = reads.map(r => ({
            userId: r.userId,
            userName: r.user.name,
            userEmail: r.user.email,
            userRole: r.user.role,
            territoryName: r.user.territory?.name || "N/A",
            readAt: r.readAt
        }));

        return NextResponse.json(mapped);
    } catch (error) {
        return handleApiError(error);
    }
}
