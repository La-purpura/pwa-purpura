import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = process.env.NEXTAUTH_SECRET || "fallback_secret_key_12345";
const key = new TextEncoder().encode(SECRET_KEY);

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const session = request.cookies.get("session")?.value;

    const isAppRoute = pathname.startsWith("/home") ||
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/tasks") ||
        pathname.startsWith("/reports") ||
        pathname.startsWith("/projects") ||
        pathname.startsWith("/team") ||
        pathname.startsWith("/library") ||
        pathname.startsWith("/admin") ||
        pathname.startsWith("/settings") ||
        pathname.startsWith("/profile");

    const isAuthRoute = pathname === "/" || pathname.startsWith("/auth/login");

    let response: NextResponse;

    if (isAppRoute && !session) {
        response = NextResponse.redirect(new URL("/", request.url));
    } else if (isAuthRoute && session) {
        try {
            await jwtVerify(session, key);
            response = NextResponse.redirect(new URL("/home", request.url));
        } catch (error) {
            response = NextResponse.next();
        }
    } else if (session && isAppRoute) {
        const { updateSession } = await import("@/lib/auth");
        const updatedResponse = await updateSession(request);
        response = updatedResponse || NextResponse.next();
    } else {
        response = NextResponse.next();
    }

    // --- Hardening: Security Headers ---
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');

    // Strict-Transport-Security (HSTS)
    if (process.env.NODE_ENV === 'production') {
        response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    // Content Security Policy (Basic)
    // Note: In Next.js with many inline scripts, this might need dynamic nonce, 
    // but for now a basic one that allows self and Google Fonts.
    const cspHeader = `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval';
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com;
        font-src 'self' https://fonts.gstatic.com;
        img-src 'self' blob: data: https://ui-avatars.com https://i.pravatar.cc https://lh3.googleusercontent.com;
        connect-src 'self';
    `.replace(/\s{2,}/g, ' ').trim();

    response.headers.set('Content-Security-Policy', cspHeader);

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
