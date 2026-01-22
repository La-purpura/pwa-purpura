import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, handleApiError } from "@/lib/guard";

export const dynamic = 'force-dynamic';

// GET: Unified feed with territorial/branch segmentation
export async function GET(request: Request) {
    try {
        const session = await requirePermission('posts:view');
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');

        const where: any = {
            isDraft: false,
            OR: [
                { territoryId: null, branchId: null },
                { territoryId: session.territoryId },
                { branchId: session.branchId }
            ]
        };

        if (type) where.type = type;

        const posts = await prisma.post.findMany({
            where,
            include: {
                author: { select: { name: true } },
                reads: { where: { userId: session.sub } }
            },
            orderBy: { publishedAt: 'desc' }
        });

        const feed = posts.map((post: any) => ({
            ...post,
            isRead: post.reads.length > 0
        }));

        return NextResponse.json(feed);
    } catch (error) {
        return handleApiError(error);
    }
}

// POST: Create announcement (Admin only)
export async function POST(request: Request) {
    try {
        const session = await requirePermission('posts:create');
        const body = await request.json();

        const post = await prisma.post.create({
            data: {
                title: body.title,
                content: body.content,
                type: body.type || 'news',
                branchId: body.branchId || null,
                territoryId: body.territoryId || null,
                authorId: session.sub,
                isDraft: body.isDraft || false,
                publishedAt: body.publishedAt ? new Date(body.publishedAt) : new Date()
            }
        });

        await prisma.auditLog.create({
            data: {
                action: 'POST_PUBLISHED',
                entity: 'Post',
                entityId: post.id,
                actorId: session.sub,
                metadata: JSON.stringify({ title: post.title, targetedScope: { territoryId: post.territoryId, branchId: post.branchId } })
            }
        });

        return NextResponse.json(post, { status: 201 });
    } catch (error) {
        return handleApiError(error);
    }
}
