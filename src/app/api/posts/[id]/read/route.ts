import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/posts/:id/read
 * Registra que el usuario actual leyó el comunicado.
 */
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requireAuth();
        const { id: postId } = params;

        const postRead = await prisma.postRead.upsert({
            where: {
                postId_userId: {
                    postId,
                    userId: session.sub
                }
            },
            update: {
                readAt: new Date()
            },
            create: {
                postId,
                userId: session.sub
            }
        });

        // Solo auditamos lectura si no es un post trivial (opcional)
        logAudit("POST_READ", "Post", postId, session.sub);

        return NextResponse.json({ success: true, readAt: postRead.readAt });
    } catch (error) {
        return handleApiError(error);
    }
}
