import { NextResponse } from "next/server";
import { requireAuth, handleApiError, applySecurityHeaders } from "@/lib/guard";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await requireAuth();

    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      include: {
        territory: true,
        branch: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json({ error: "Cuenta suspendida" }, { status: 403 });
    }

    const response = NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      alias: user.alias,
      phone: user.phone,
      role: user.role,
      status: user.status,
      branchId: user.branchId,
      branch: user.branch?.name,
      territoryId: user.territoryId,
      territory: user.territory?.name || "Global",
      territoryScope: user.territoryScope,
      photoUrl: user.photoUrl,
      avatar: user.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.alias || user.name || "User")}&background=random`
    });

    return applySecurityHeaders(response, { noStore: true });

  } catch (error) {
    return handleApiError(error);
  }
}
