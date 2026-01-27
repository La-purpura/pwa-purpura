import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requirePermission, enforceScope, handleApiError, applySecurityHeaders } from "@/lib/guard";
import { logAudit } from "@/lib/audit";
import { UserCreateSchema } from "@/lib/schemas";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const session = await requirePermission('users:view');

    const scopeFilter = await enforceScope(session);
    const where: any = { ...scopeFilter };

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        branchId: true,
        territoryId: true,
        territory: { select: { name: true } },
        branch: { select: { name: true } },
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const mapped = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      territory: u.territory?.name || "Nacional",
      branch: u.branch?.name || "Sin rama",
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || "User")}&background=random`
    }));

    const response = NextResponse.json(mapped);
    return applySecurityHeaders(response, { noStore: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requirePermission('users:invite');
    const body = await request.json();

    // Input Validation with Zod
    const result = UserCreateSchema.safeParse(body);
    if (!result.success) {
      return handleApiError(result.error);
    }

    const { email, role, name, territoryId, branchId, password } = result.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "El usuario ya existe" }, { status: 409 });
    }

    const tempPassword = password || "Purpura2026!";
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name || "Usuario Nuevo",
        email: email,
        role: role,
        passwordHash: hashedPassword,
        status: "ACTIVE",
        territoryId: territoryId || null,
        branchId: branchId || null
      }
    });

    logAudit("USER_CREATED", "User", newUser.id, session.sub, {
      email,
      role,
      assignedTerritory: territoryId
    });

    const response = NextResponse.json({
      success: true,
      user: { id: newUser.id, email: newUser.email },
      tempPassword
    }, { status: 201 });

    return applySecurityHeaders(response, { noStore: true });

  } catch (error) {
    return handleApiError(error);
  }
}
