
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, handleApiError } from "@/lib/guard";
import { generateTwoFactorSecret } from "@/lib/twofactor";
import * as QRCode from "qrcode";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/auth/2fa/setup
 * Generates a secret and returns QR code for scanning.
 * Does NOT enable 2FA yet. User must verify code in next step.
 */
export async function POST(request: Request) {
    try {
        const session = await requireAuth();

        const user = await prisma.user.findUnique({
            where: { id: session.sub }
        });

        if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

        // Generate Secret
        const { secret, otpauthUrl } = generateTwoFactorSecret(user.email);

        // Save secret temporarily (or permanently but disabled)
        await prisma.user.update({
            where: { id: session.sub },
            data: { twoFactorSecret: secret }
        });

        // Generate QR Code Data URL
        const qrCode = await QRCode.toDataURL(otpauthUrl);

        logAudit("2FA_SETUP_INITIATED", "User", user.id, user.id, {});

        return NextResponse.json({
            secret,
            qrCode
        });

    } catch (error) {
        return handleApiError(error);
    }
}
