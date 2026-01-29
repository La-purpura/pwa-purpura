
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, enforceScope, handleApiError } from "@/lib/guard";
import { getSignedDownloadUrl } from "@/lib/storage";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/attachments
 * Lista adjuntos para una entidad específica.
 * Query params: ownerType, ownerId
 */
export async function GET(request: Request) {
    try {
        const session = await requireAuth();
        const { searchParams } = new URL(request.url);
        const ownerType = searchParams.get('ownerType');
        const ownerId = searchParams.get('ownerId');

        if (!ownerType || !ownerId) {
            return NextResponse.json({ error: "ownerType y ownerId son requeridos" }, { status: 400 });
        }

        // Filtro de alcance opcional (si el usuario tiene acceso a la entidad dueña)
        // Por simplicidad, buscamos adjuntos que no estén marcados como eliminados.
        // @ts-ignore
        const attachments = await prisma.attachment.findMany({
            where: {
                ownerType,
                ownerId,
                deletedAt: null
            },
            orderBy: { createdAt: 'desc' }
        });

        // Generamos URLs firmadas para previsualización o descarga inmediata
        const mapped = await Promise.all(attachments.map(async (a: any) => ({
            ...a,
            downloadUrl: await getSignedDownloadUrl(a.fileKey).catch(() => null)
        })));

        return NextResponse.json(mapped);

    } catch (error) {
        return handleApiError(error);
    }
}
