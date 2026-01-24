import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, handleApiError } from "@/lib/guard";
import { generateInviteToken, hashInviteToken } from "@/lib/invites";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';

/**
 * GET /api/invites
 * Lista las invitaciones generadas (vista administrativa).
 * NUNCA debe devolver el token plano o el hash del token.
 */
export async function GET() {
  try {
    const session = await requirePermission('users:invite');

    const invites = await prisma.invitation.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        branchId: true,
        territoryScope: true,
        expiresAt: true,
        usedAt: true,
        revokedAt: true,
        createdAt: true,
        invitedBy: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(invites);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/invites
 * Crea una nueva invitación y devuelve el link único.
 */
export async function POST(request: Request) {
  try {
    const session = await requirePermission('users:invite');
    const body = await request.json();
    const {
      email,
      firstName,
      lastName,
      roleCode,
      branchId,
      territoryScope,
      expiresHours = 48
    } = body;

    if (!email || !roleCode) {
      return NextResponse.json({ error: "Faltan datos obligatorios (email, roleCode)" }, { status: 400 });
    }

    // 1. Generar tokens
    const plainToken = generateInviteToken();
    const tokenHash = hashInviteToken(plainToken);

    // 2. Calcular expiración
    const expiresAt = new Date(Date.now() + expiresHours * 60 * 60 * 1000);

    // 3. Crear en DB
    const invitation = await prisma.invitation.create({
      data: {
        email,
        firstName,
        lastName,
        role: roleCode,
        branchId,
        territoryScope,
        tokenHash,
        expiresAt,
        createdById: session.sub
      }
    });

    // 4. Construir URL
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const host = request.headers.get("host") || "localhost:3000";
    const inviteUrl = `${protocol}://${host}/auth/activate?token=${plainToken}`;

    // 5. Auditar
    logAudit("USER_INVITED", "Invitation", invitation.id, session.sub, {
      email,
      role: roleCode,
      expiresAt
    });

    return NextResponse.json({
      success: true,
      inviteUrl,
      expiresAt,
      invitationId: invitation.id
    });

  } catch (error) {
    return handleApiError(error);
  }
}
