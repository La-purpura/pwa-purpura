import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { requirePermission, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const session = await requirePermission('users:view');

    const where: any = {};
    // Scope Enforcement (Si mi usuario está restringido a un territorio, solo veo mis pares/hijos)
    // Nota: La jerarquía real recursiva (hijos de mis hijos) requiere queries más complejas.
    // Para MVP M4, filtro directo por territoryId.
    if (session.territoryId) {
      where.territoryId = session.territoryId;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        territory: { select: { name: true } },
        branch: { select: { name: true } },
        createdAt: true
        // No devolvemos password nunca
      },
      orderBy: { createdAt: 'desc' }
    });

    // Mapeo para frontend
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

    // Verificar unicidad
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      return NextResponse.json({ error: "El usuario ya existe" }, { status: 409 });
    }

    // Hash Password (Default o provisto)
    const tempPassword = body.password || "Purpura2026!";
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        name: body.name || "Usuario Nuevo",
        email: body.email,
        role: body.role,
        password: hashedPassword,
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
      tempPassword // En producción esto se envía por email, no por API response
    }, { status: 201 });

  } catch (error) {
    return handleApiError(error);
  }
}
