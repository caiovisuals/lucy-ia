type RateLimitEntry = { count: number; resetAt: number }

// In-memory store (replace with Redis in production for multi-instance deployments)
const store = new Map<string, RateLimitEntry>()

export interface RateLimitConfig {
    /** Max requests allowed in the window */
    limit: number
    /** Window duration in seconds */
    windowSec: number
}

export interface RateLimitResult {
    success: boolean
    limit: number
    remaining: number
    resetAt: number
}

export function rateLimit(key: string, config: RateLimitConfig): RateLimitResult {
    const now = Date.now()
    const windowMs = config.windowSec * 1000
    let entry = store.get(key)

    if (!entry || now > entry.resetAt) {
        entry = { count: 1, resetAt: now + windowMs }
        store.set(key, entry)
    } else {
        entry.count++
    }

    const remaining = Math.max(0, config.limit - entry.count)
    const success = entry.count <= config.limit

    return { success, limit: config.limit, remaining, resetAt: entry.resetAt }
}

// Periodically clear expired entries to avoid memory leaks
if (typeof setInterval !== "undefined") {
    setInterval(() => {
        const now = Date.now()
        for (const [key, entry] of store.entries()) {
            if (now > entry.resetAt) store.delete(key)
        }
    }, 60_000)
}

export const RATE_LIMITS = {
    login: { limit: 10, windowSec: 60 },
    register: { limit: 5, windowSec: 300 },
    api: { limit: 60, windowSec: 60 },
    chat: { limit: 30, windowSec: 60 },
} as const