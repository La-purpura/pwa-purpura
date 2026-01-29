
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/attachments/commit
 * Confirma la subida de un archivo guardando su metadata en la DB.
 */
export async function POST(request: Request) {
    try {
        const session = await requireAuth();
        const {
            fileName,
            fileKey,
            thumbnailKey,
            fileSize,
            mimeType,
            ownerType,
            ownerId,
            territoryId
        } = await request.json();

        if (!fileName || !fileKey || !ownerType || !ownerId) {
            return NextResponse.json({ error: "Datos incompletos para commit" }, { status: 400 });
        }

        // @ts-ignore
        const attachment = await prisma.attachment.create({
            data: {
                fileName,
                fileKey,
                thumbnailKey: thumbnailKey || null,
                fileSize: fileSize || 0,
                mimeType,
                ownerType,
                ownerId,
                territoryId: territoryId || null,
                uploadedById: session.sub
            }
        });

        logAudit("ATTACHMENT_CREATED", ownerType, ownerId, session.sub, {
            fileName,
            attachmentId: attachment.id
        });

        return NextResponse.json(attachment, { status: 201 });

    } catch (error) {
        return handleApiError(error);
    }
}
