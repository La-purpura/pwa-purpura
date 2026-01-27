import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * PATCH /api/posts/:id
 */
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requirePermission('posts:create');
        const body = await request.json();
        const { id } = params;

        const updated = await prisma.post.update({
            where: { id },
            data: body
        });

        logAudit("POST_PUBLISHED", "Post", id, session.sub, { updates: body }); // Usamos PUBLISHED como "Editado"

        return NextResponse.json(updated);
    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * DELETE /api/posts/:id
 */
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await requirePermission('posts:create');
        const { id } = params;

        await prisma.post.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleApiError(error);
    }
}
