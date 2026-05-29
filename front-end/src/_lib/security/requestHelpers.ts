import { NextResponse } from "next/server"
import { rateLimit, RateLimitConfig, RateLimitResult } from "./rateLimit"
import { getClientIp } from "./logging"

export function rateLimitResponse(result: RateLimitResult): NextResponse {
    return NextResponse.json(
        { error: "Muitas requisições. Tente novamente mais tarde." },
        {
            status: 429,
            headers: {
                "X-RateLimit-Limit": String(result.limit),
                "X-RateLimit-Remaining": String(result.remaining),
                "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
                "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
            },
        }
    )
}

export function checkRateLimit(request: Request, config: RateLimitConfig): RateLimitResult {
    const ip = getClientIp(request)
    return rateLimit(`${ip}:${new URL(request.url).pathname}`, config)
}

export function securityHeaders(): Record<string, string> {
    return {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
        "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    }
}

export function applySecurityHeaders(response: NextResponse): NextResponse {
    for (const [key, value] of Object.entries(securityHeaders())) {
        response.headers.set(key, value)
    }
    return response
}

export function jsonError(message: string, status: number, extra?: Record<string, unknown>): NextResponse {
    return NextResponse.json({ error: message, ...extra }, { status })
}