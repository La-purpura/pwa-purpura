import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = process.env.NEXTAUTH_SECRET || "fallback_secret_key_12345";
const key = new TextEncoder().encode(SECRET_KEY);

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const session = request.cookies.get("session")?.value;

    // Rutas protegidas (que requieren sesión)
    const isAppRoute = pathname.startsWith("/home") ||
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/tasks") ||
        pathname.startsWith("/incidents") ||
        pathname.startsWith("/projects") ||
        pathname.startsWith("/team") ||
        pathname.startsWith("/library") ||
        pathname.startsWith("/admin") ||
        pathname.startsWith("/settings") ||
        pathname.startsWith("/profile");

    // Rutas de auth (que deben redirigir al dashboard si ya hay sesión)
    const isAuthRoute = pathname === "/" || pathname.startsWith("/auth/login");

    if (isAppRoute && !session) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    if (isAuthRoute && session) {
        try {
            await jwtVerify(session, key);
            // Si el token es válido, redirigir al home/dashboard
            // Nota: Aquí no verificamos la DB por performance en el middleware (Edge runtime)
            // La validación real ocurre en /api/me y en los handlers de API
            return NextResponse.redirect(new URL("/home", request.url));
        } catch (error) {
            // Token inválido, dejar que siga al login
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
