
import { NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/guard";
import { getPresignedUploadUrl } from "@/lib/storage";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/uploads/presign
 * Genera una URL firmada para subida directa al storage.
 */
export async function POST(request: Request) {
    try {
        const session = await requireAuth();
        const { fileName, mimeType, fileSize } = await request.json();

        if (!fileName || !mimeType) {
            return NextResponse.json({ error: "fileName y mimeType son requeridos" }, { status: 400 });
        }

        // Validación de tamaño (ej: 50MB max)
        const MAX_SIZE = 50 * 1024 * 1024;
        if (fileSize && fileSize > MAX_SIZE) {
            return NextResponse.json({ error: "Archivo demasiado grande (max 50MB)" }, { status: 400 });
        }

        // Validación de tipos permitidos (opcional pero recomendado)
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(mimeType)) {
            // Podríamos ser menos estrictos o más estrictos según requerimiento
            // return NextResponse.json({ error: "Tipo de archivo no permitido" }, { status: 400 });
        }

        const { key, uploadUrl } = await getPresignedUploadUrl(fileName, mimeType);

        return NextResponse.json({
            key,
            uploadUrl,
            publicUrl: `${process.env.R2_PUBLIC_DOMAIN || ''}/${key}`
        });

    } catch (error) {
        return handleApiError(error);
    }
}
