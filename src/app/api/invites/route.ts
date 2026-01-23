import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendInvitationEmail } from "@/lib/email";
import crypto from "crypto";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const invites = await prisma.invitation.findMany({
      include: { invitedBy: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(invites);
  } catch (error) {
    return NextResponse.json({ error: "No se pudieron obtener las invitaciones" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { email, name, role, expiresIn = "48h" } = body;

    if (!email || !role) {
      return NextResponse.json({ error: "Email y Rol son obligatorios" }, { status: 400 });
    }

    // Generar token único
    const token = crypto.randomBytes(32).toString('hex');

    // Calcular expiración
    let hours = 48;
    if (expiresIn === "24h") hours = 24;
    if (expiresIn === "7d") hours = 168;

    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

    // Crear registro en DB
    const invitation = await prisma.invitation.create({
      data: {
        email,
        role,
        tokenHash: token, // Renombrado en schema
        expiresAt,
        createdById: session.sub, // Renombrado en schema
      }
    });

    // Construir enlace de activación
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const host = request.headers.get("host") || "localhost:3000";
    const link = `${protocol}://${host}/auth/activate?token=${token}&name=${encodeURIComponent(name || "")}&email=${encodeURIComponent(email)}`;

    await sendInvitationEmail({
      to: email,
      name: name || email,
      role,
      link
    });

    return NextResponse.json({
      success: true,
      invitation,
      link
    });
  } catch (error: any) {
    console.error("Error creating invitation:", error);
    return NextResponse.json({ error: error.message || "Error interno" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID de invitación requerido" }, { status: 400 });
    }

    await prisma.invitation.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Invitación revocada" });
  } catch (error: any) {
    console.error("Error revoking invitation:", error);
    return NextResponse.json({ error: "Error al revocar invitación" }, { status: 500 });
  }
}
