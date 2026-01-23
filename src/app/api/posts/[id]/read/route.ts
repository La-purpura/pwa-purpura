import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, handleApiError } from "@/lib/guard";

export const dynamic = 'force-dynamic';

// POST: Register that the current user has read the post
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requirePermission('posts:view');
        const { id } = params;

        const postRead = await prisma.postRead.upsert({
            where: {
                postId_userId: {
                    postId: id,
                    userId: session.sub
                }
            },
            update: {
                readAt: new Date()
            },
            create: {
                postId: id,
                userId: session.sub
            }
        });

        const post = await prisma.post.findUnique({ where: { id } });
        if (post?.type === 'urgent') {
            await prisma.auditLog.create({
                data: {
                    action: 'POST_READ',
                    entity: 'Post',
                    entityId: id,
                    actorId: session.sub,
                    metadata: JSON.stringify({ title: post.title })
                }
            });
        }

        return NextResponse.json({ success: true, readAt: postRead.readAt });
    } catch (error) {
        return handleApiError(error);
    }
}
