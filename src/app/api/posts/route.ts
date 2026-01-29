import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, enforceScope, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/posts
 */
export async function GET(request: Request) {
    try {
        const session = await requirePermission('posts:view');
        const { searchParams } = new URL(request.url);

        const type = searchParams.get('type');
        const query = searchParams.get('q');
        const cursorId = searchParams.get('cursor');
        const limitParams = searchParams.get('limit');
        const limit = limitParams ? Math.min(parseInt(limitParams), 50) : 10;

        // ABAC: Filtrar por alcance territorial many-to-many
        const scopeFilter = await enforceScope(session, {
            isMany: true,
            relationName: 'territories',
            logic: 'OR' // Posts se ven si son globales O de tu zona O de tu rama
        });

        const where: any = {
            isDraft: false,
            ...scopeFilter
        };

        if (type) where.type = type;
        if (query) {
            where.OR = [
                { title: { contains: query, mode: 'insensitive' } },
                { content: { contains: query, mode: 'insensitive' } }
            ];
        }

        const posts = await prisma.post.findMany({
            where,
            take: limit + 1,
            cursor: cursorId ? { id: cursorId } : undefined,
            skip: cursorId ? 1 : 0,
            include: {
                author: { select: { name: true } },
                territories: { include: { territory: { select: { name: true } } } },
                reads: { where: { userId: session.sub } }
            },
            orderBy: { publishedAt: 'desc' }
        });

        let nextCursor = null;
        if (posts.length > limit) {
            const nextItem = posts.pop();
            nextCursor = nextItem?.id;
        }

        const feed = posts.map((post: any) => ({
            ...post,
            isRead: post.reads.length > 0,
            territoryNames: post.territories.map((t: any) => t.territory.name).join(', ') || 'Global'
        }));

        return NextResponse.json({ items: feed, nextCursor }, { headers: { 'Cache-Control': 'no-store' } });

    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * POST /api/posts
 */
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
                authorId: session.sub,
                isDraft: body.isDraft || false,
                publishedAt: new Date(),
                territories: {
                    create: (body.territoryIds || []).map((tid: string) => ({
                        territoryId: tid
                    }))
                }
            }
        });

        logAudit("POST_PUBLISHED", "Post", post.id, session.sub, { title: post.title });

        return NextResponse.json(post, { status: 201 });
    } catch (error) {
        return handleApiError(error);
    }
}
