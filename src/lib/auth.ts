import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const SECRET_KEY = process.env.NEXTAUTH_SECRET || "fallback_secret_key_12345";
const key = new TextEncoder().encode(SECRET_KEY);

export type SessionPayload = {
    sub: string; // User ID
    email: string;
    role: string;
    territoryId?: string;
    branchId?: string;
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
        return payload as SessionPayload;
    } catch (error) {
        return null; // Invalid token
    }
}

export async function getSession() {
    const sessionCookie = cookies().get("session")?.value;
    if (!sessionCookie) return null;
    return await verifySession(sessionCookie);
}

export async function createSessionCookie(payload: SessionPayload) {
    const token = await signSession(payload);
    // Configurar cookie
    const expires = new Date(Date.now() + SESSION_DURATION);

    cookies().set("session", token, {
        expires,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    });
}

export async function logout() {
    cookies().set("session", "", { expires: new Date(0) });
}

export async function updateSession(request: NextRequest) {
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) return;

    // Refresh simple: extender expiración si es válido
    const payload = await verifySession(sessionCookie);
    if (!payload) return;

    const expires = new Date(Date.now() + SESSION_DURATION);
    const res = NextResponse.next();

    res.cookies.set({
        name: "session",
        value: await signSession({ ...payload, exp: undefined, iat: undefined }), // Renovar firma
        httpOnly: true,
        expires,
    });
    return res;
}
