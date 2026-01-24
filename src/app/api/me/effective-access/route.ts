import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ROLE_PERMISSIONS, Role } from "@/lib/rbac";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.sub }
        });

        if (!user) {
            return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
        }

        const role = user.role as Role;
        const permissions = ROLE_PERMISSIONS[role] || [];

        return NextResponse.json({
            role: user.role,
            permissions,
            branchId: user.branchId,
            territoryScope: user.territoryScope
        }, {
            headers: {
                'Cache-Control': 'no-store, max-age=0'
            }
        });

    } catch (error) {
        console.error("GET /api/me/effective-access error:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
