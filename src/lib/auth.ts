import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import prisma from "./prisma";

const SECRET_KEY = process.env.NEXTAUTH_SECRET || "fallback_secret_key_12345";
const key = new TextEncoder().encode(SECRET_KEY);

export type SessionPayload = {
    sub: string; // User ID
    email: string;
    role: string;
    sid: string;  // Session ID in DB
    territoryId?: string;
    branchId?: string;
    twoFactorVerified?: boolean;
    iat?: number;
    exp?: number;
};

// Duración de sesión: 24 horas
const SESSION_DURATION = 24 * 60 * 60 * 1000;

export async function signSession(payload: SessionPayload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(key);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: ["HS256"],
        });

        const sessionPayload = payload as unknown as SessionPayload;

        // Verificar en DB (Sesión y Usuario)
        const dbSession = await prisma.session.findUnique({
            where: { id: sessionPayload.sid },
            include: { user: { select: { status: true } } }
        });

        if (!dbSession || dbSession.revokedAt || dbSession.expiresAt < new Date() || dbSession.user.status !== 'ACTIVE') {
            return null;
        }

        return sessionPayload;
    } catch (error) {
        return null; // Invalid token
    }
}

export async function getSession() {
    const sessionCookie = cookies().get("session")?.value;
    if (!sessionCookie) return null;
    return await verifySession(sessionCookie);
}

export async function createSessionCookie(payload: Omit<SessionPayload, "sid">) {
    // Generar registro de sesión en DB
    const expiresAt = new Date(Date.now() + SESSION_DURATION);

    // Generate random hex for tokenHash using Web Crypto (Edge compatible)
    const randomArray = new Uint8Array(32);
    globalThis.crypto.getRandomValues(randomArray);
    const tokenHash = Array.from(randomArray)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    const dbSession = await prisma.session.create({
        data: {
            userId: payload.sub,
            expiresAt,
            tokenHash
        }
    });

    const token = await signSession({ ...payload, sid: dbSession.id });

    // Configurar cookie
    cookies().set("session", token, {
        expires: expiresAt,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    });
}

export async function logout() {
    const sessionCookie = cookies().get("session")?.value;
    if (sessionCookie) {
        const payload = await verifySession(sessionCookie);
        if (payload?.sid) {
            await prisma.session.update({
                where: { id: payload.sid },
                data: { revokedAt: new Date() }
            });
        }
    }
    cookies().set("session", "", { expires: new Date(0) });
}

export async function updateSession(request: NextRequest) {
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) return;

    const payload = await verifySession(sessionCookie);
    if (!payload) return;

    // Renovar solo si no ha revocado
    const expires = new Date(Date.now() + SESSION_DURATION);
    const res = NextResponse.next();

    res.cookies.set({
        name: "session",
        value: await signSession({ ...payload, exp: undefined, iat: undefined }),
        httpOnly: true,
        expires,
    });
    return res;
}
