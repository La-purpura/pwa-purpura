import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, handleApiError, applySecurityHeaders } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/me/profile
 * Updates the current user's profile information.
 */
export async function PATCH(request: Request) {
    try {
        const session = await requireAuth();
        const body = await request.json();

        // White-list of fields that the user can update themselves
        const { name, alias, phone, photoUrl } = body;

        const updatedUser = await prisma.user.update({
            where: { id: session.sub },
            data: {
                name: name !== undefined ? name : undefined,
                alias: alias !== undefined ? alias : undefined,
                phone: phone !== undefined ? phone : undefined,
                photoUrl: photoUrl !== undefined ? photoUrl : undefined,
            },
            select: {
                id: true,
                name: true,
                alias: true,
                email: true,
                phone: true,
                photoUrl: true,
                role: true,
                territoryId: true,
                branchId: true
            }
        });

        logAudit("PROFILE_UPDATED", "User", updatedUser.id, session.sub, {
            fields: Object.keys(body)
        });

        const response = NextResponse.json(updatedUser);
        return applySecurityHeaders(response);
    } catch (error) {
        return handleApiError(error);
    }
}
