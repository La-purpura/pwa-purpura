import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requirePermission, enforceScope, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';

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

    return NextResponse.json(mapped);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requirePermission('users:invite');
    const body = await request.json();

    if (!body.email || !body.role) {
      return NextResponse.json({ error: "Faltan datos obligatorios (email, role)" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      return NextResponse.json({ error: "El usuario ya existe" }, { status: 409 });
    }

    const tempPassword = body.password || "Purpura2026!";
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        name: body.name || "Usuario Nuevo",
        email: body.email,
        role: body.role,
        passwordHash: hashedPassword,
        status: "ACTIVE",
        territoryId: body.territoryId || null,
        branchId: body.branchId || null
      }
    });

    logAudit("USER_CREATED", "User", newUser.id, session.sub, {
      email: body.email,
      role: body.role,
      assignedTerritory: body.territoryId
    });

    return NextResponse.json({
      success: true,
      user: { id: newUser.id, email: newUser.email },
      tempPassword
    }, { status: 201 });

  } catch (error) {
    return handleApiError(error);
  }
}
