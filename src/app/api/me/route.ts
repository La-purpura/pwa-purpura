import { NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/guard";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

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

    // Devolvemos el usuario sin el hash de la contraseña
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      branchId: user.branchId,
      branch: user.branch?.name,
      territoryId: user.territoryId,
      territory: user.territory?.name || "Global",
      territoryScope: user.territoryScope,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=random`
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });

  } catch (error) {
    return handleApiError(error);
  }
}
