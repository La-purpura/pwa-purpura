import { NextResponse } from "next/server";
import { logout, getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { applySecurityHeaders } from "@/lib/guard";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST() {
    const session = await getSession();

    if (session) {
        await logAudit("LOGOUT", "User", session.sub, session.sub, { email: session.email });
    }

    await logout();
    const response = NextResponse.json({ success: true, message: "Sesión cerrada" });
    return applySecurityHeaders(response, { noStore: true });
}
