type FailEntry = { count: number; firstAt: number; lockedUntil?: number }

const failStore = new Map<string, FailEntry>()

const LOCK_THRESHOLDS = [
    { attempts: 5, lockMs: 60_000 },
    { attempts: 10, lockMs: 300_000 },
    { attempts: 20, lockMs: 3_600_000 },
]
const WINDOW_MS = 15 * 60_000

export interface SuspiciousCheckResult {
    blocked: boolean
    lockRemainingMs?: number
    reason?: string
}

export function recordFailedAttempt(ip: string): void {
    const now = Date.now()
    const entry = failStore.get(ip)

    if (!entry || now - entry.firstAt > WINDOW_MS) {
        failStore.set(ip, { count: 1, firstAt: now })
        return
    }

    entry.count++

    for (const { attempts, lockMs } of LOCK_THRESHOLDS.slice().reverse()) {
        if (entry.count >= attempts) {
            entry.lockedUntil = now + lockMs
            break
        }
    }
}

export function clearFailedAttempts(ip: string): void {
    failStore.delete(ip)
}

export function isSuspicious(ip: string): SuspiciousCheckResult {
    const now = Date.now()
    const entry = failStore.get(ip)

    if (!entry) return { blocked: false }

    if (entry.lockedUntil && now < entry.lockedUntil) {
        return {
            blocked: true,
            lockRemainingMs: entry.lockedUntil - now,
            reason: "Too many failed attempts",
        }
    }

    // Window expired — clean up
    if (now - entry.firstAt > WINDOW_MS) {
        failStore.delete(ip)
        return { blocked: false }
    }

    return { blocked: false }
}

if (typeof setInterval !== "undefined") {
    setInterval(() => {
        const now = Date.now()
        for (const [ip, entry] of failStore.entries()) {
            if (!entry.lockedUntil && now - entry.firstAt > WINDOW_MS) {
                failStore.delete(ip)
            }
        }
    }, 5 * 60_000)
}