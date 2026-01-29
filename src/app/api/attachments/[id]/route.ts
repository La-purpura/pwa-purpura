
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";
import { deleteFile } from "@/lib/storage";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * DELETE /api/attachments/:id
 * Realiza soft-delete de un adjunto.
 * Query param: hard=true para borrar también del storage.
 */
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requireAuth();
        const { id } = params;
        const { searchParams } = new URL(request.url);
        const hard = searchParams.get('hard') === 'true';

        // @ts-ignore
        const existing = await prisma.attachment.findUnique({
            where: { id }
        });

        if (!existing) {
            return NextResponse.json({ error: "Adjunto no encontrado" }, { status: 404 });
        }

        // Validación de propiedad (solo quien subió o admin)
        const isAdmin = ['SuperAdminNacional', 'AdminProvincial'].includes(session.role);
        if (existing.uploadedById !== session.sub && !isAdmin) {
            return NextResponse.json({ error: "No tienes permiso para borrar este archivo" }, { status: 103 }); // PermissionError simulation
        }

        if (hard) {
            // Borrar de DB y Storage
            // @ts-ignore
            await prisma.attachment.delete({ where: { id } });
            await deleteFile(existing.fileKey).catch(console.error);
            logAudit("ATTACHMENT_DELETED_HARD", existing.ownerType, existing.ownerId, session.sub, { fileName: existing.fileName });
        } else {
            // Soft-delete
            // @ts-ignore
            await prisma.attachment.update({
                where: { id },
                data: { deletedAt: new Date() }
            });
            logAudit("ATTACHMENT_DELETED_SOFT", existing.ownerType, existing.ownerId, session.sub, { fileName: existing.fileName });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        return handleApiError(error);
    }
}
