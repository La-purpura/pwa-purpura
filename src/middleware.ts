import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { rateLimit } from "@/lib/rate-limit";

const SECRET_KEY = process.env.NEXTAUTH_SECRET || "fallback_secret_key_12345";
const key = new TextEncoder().encode(SECRET_KEY);

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const session = request.cookies.get("session")?.value;

    // Observability: Correlation ID
    const requestId = request.headers.get("x-request-id") || globalThis.crypto.randomUUID();

    // Rate Limiting
    const isApi = pathname.startsWith('/api/');
    const isAuth = pathname.startsWith('/auth') || pathname.startsWith('/api/auth');

    let limit = 200;
    if (isApi) limit = 60;
    if (isAuth) limit = 20;

    const { isRateLimited, info } = rateLimit(request, { limit, windowMs: 60 * 1000 });

    if (isRateLimited) {
        return new NextResponse(JSON.stringify({ error: 'Too Many Requests', retryAfter: info.reset }), {
            status: 429,
            headers: {
                'Content-Type': 'application/json',
                'X-RateLimit-Limit': info.limit.toString(),
                'X-RateLimit-Remaining': info.remaining.toString(),
                'X-RateLimit-Reset': info.reset
            }
        });
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-request-id", requestId);
    requestHeaders.set("x-path", pathname); // Pass path for logging later

    // ... continue logic with `requestHeaders` passed to `NextResponse.next({ headers: requestHeaders })`
    // but the logic below constructs `response` differently.

    const isAppRoute = pathname.startsWith("/home") ||
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/tasks") ||
        pathname.startsWith("/reports") ||
        pathname.startsWith("/incidents") ||
        pathname.startsWith("/projects") ||
        pathname.startsWith("/team") ||
        pathname.startsWith("/library") ||
        pathname.startsWith("/admin") ||
        pathname.startsWith("/settings") ||
        pathname.startsWith("/profile");

    const isAuthRoute = pathname === "/" || pathname.startsWith("/auth/login");

    let response: NextResponse | undefined;

    // We need to ensure we use the new headers
    // When redirecting, we don't necessarily pass headers to the *next* request unless we forward them?
    // Actually redirects are new responses.

    // Logic refactor to support headers injection in `next()` calls.

    if (isAppRoute && !session) {
        response = NextResponse.redirect(new URL("/", request.url));
    } else if (isAuthRoute && session) {
        try {
            await jwtVerify(session, key);
            response = NextResponse.redirect(new URL("/home", request.url));
        } catch (error) {
            response = NextResponse.next({ request: { headers: requestHeaders } });
        }
    } else if (session && isAppRoute) {
        // Here updateSession might complicate things if it doesn't accept headers override
        // Assuming updateSession handles it or we wrap it.
        // For now, let's look at how updateSession is implemented. 
        // If I can't easily change updateSession, I might lose the header on session refresh?
        // Let's assume response = NextResponse.next...
        // I will just modify the response objects created.

        try {
            const { updateSession } = await import("@/lib/auth");
            // Note: updateSession likely returns a Response object.
            // We can't injected request headers easily into an already running logic inside updateSession unless we modify updateSession.
            // However, for the *downstream* handler (page/api), we need `request` to have the header.
            // `updateSession` takes `request`. We should pass written headers?
            // `NextResponse.next` takes options. 
            // Let's modify the request passed to updateSession if possible, or accept that updateSession creates a response.

            // Actually, simplest way: Just create response then set headers on it.
            // But for `x-request-id` to reach the API route (Server Component), it MUST be in `request.headers` when calling `next()`.

            const updatedResponse = await updateSession(request); // We can't change request in place for the function call easily?

            if (updatedResponse) {
                response = updatedResponse;
            } else {
                response = NextResponse.next({ request: { headers: requestHeaders } });
            }
        } catch (e) {
            response = NextResponse.next({ request: { headers: requestHeaders } });
        }
    } else {
        response = NextResponse.next({ request: { headers: requestHeaders } });
    }

    if (!response) response = NextResponse.next({ request: { headers: requestHeaders } });

    // Set Response Headers (so client sees ID)
    response.headers.set("x-request-id", requestId);
    // ... hardening headers ...

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
