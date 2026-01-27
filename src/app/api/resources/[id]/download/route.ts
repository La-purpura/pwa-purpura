
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, enforceScope, handleApiError } from "@/lib/guard";
import { getSignedDownloadUrl } from "@/lib/storage";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/resources/:id/download
 * Generates a signed URL for the latest version of the resource.
 */
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requireAuth();
        const { id } = params;

        // Verify scope access
        const scopeFilter = await enforceScope(session, { isMany: true, relationName: 'territories', logic: 'OR' });

        const resource = await prisma.resource.findFirst({
            where: {
                id,
                ...scopeFilter
            },
            include: {
                // @ts-ignore
                versions: {
                    orderBy: { version: 'desc' },
                    take: 1
                }
            }
        });

        if (!resource) {
            return NextResponse.json({ error: "Recurso no encontrado o acceso denegado" }, { status: 404 });
        }

        // @ts-ignore
        const latestVersion = resource.versions[0];
        if (!latestVersion) {
            return NextResponse.json({ error: "El recurso no tiene versiones disponibles" }, { status: 404 });
        }

        const signedUrl = await getSignedDownloadUrl(latestVersion.fileKey);

        // Redirect to signed URL
        return NextResponse.redirect(signedUrl);

    } catch (error) {
        return handleApiError(error);
    }
}
