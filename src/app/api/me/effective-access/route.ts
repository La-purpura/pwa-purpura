import { NextResponse } from "next/server";
import { requireAuth, handleApiError, applySecurityHeaders } from "@/lib/guard";
import prisma from "@/lib/prisma";
import { ROLE_PERMISSIONS, Role } from "@/lib/rbac";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
    try {
        const session = await requireAuth();

        const user = await prisma.user.findUnique({
            where: { id: session.sub }
        });

        if (!user) {
            return applySecurityHeaders(
                NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 }),
                { noStore: true }
            );
        }

        const role = user.role as Role;
        const permissions = ROLE_PERMISSIONS[role] || [];

        const response = NextResponse.json({
            role: user.role,
            permissions,
            branchId: user.branchId,
            territoryScope: user.territoryScope
        });

        return applySecurityHeaders(response, { noStore: true });

    } catch (error) {
        return handleApiError(error);
    }
}
