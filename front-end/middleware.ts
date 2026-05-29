import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { rateLimit } from "@/_lib/security/rateLimit"
import { isSuspicious } from "@/_lib/security/suspicious"

const PROTECTED_ROUTES = ["/chat", "/settings", "/api/chat"]
const AUTH_ROUTES = ["/login", "/register"]

export async function middleware(request: NextRequest) {
    const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
        request.headers.get("x-real-ip") ??
        "unknown"
    const { pathname } = request.nextUrl

    // Block IPs with suspicious activity history on auth routes
    if (AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
        const suspicious = isSuspicious(ip)
        if (suspicious.blocked) {
            return NextResponse.json(
                { error: "Acesso bloqueado temporariamente." },
                { status: 403 }
            )
        }
    }

    // API rate limiting
    if (pathname.startsWith("/api/")) {
        const result = rateLimit(`api:${ip}`, { limit: 100, windowSec: 60 })
        if (!result.success) {
            return NextResponse.json(
                { error: "Muitas requisições. Tente novamente mais tarde." },
                {
                    status: 429,
                    headers: {
                        "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
                    },
                }
            )
        }
    }

    // Protect routes that require authentication
    if (PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET,
        })
        if (!token) {
            const loginUrl = new URL("/login", request.url)
            loginUrl.searchParams.set("callbackUrl", pathname)
            return NextResponse.redirect(loginUrl)
        }
    }

    // Redirect authenticated users away from auth pages
    if (AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET,
        })
        if (token) {
            return NextResponse.redirect(new URL("/", request.url))
        }
    }

    const response = NextResponse.next()

    // Security headers on all responses
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-XSS-Protection", "1; mode=block")
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
    if (process.env.NODE_ENV === "production") {
        response.headers.set(
            "Strict-Transport-Security",
            "max-age=63072000; includeSubDomains; preload"
        )
    }

    return response
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|ogimage.png).*)",
    ],
}