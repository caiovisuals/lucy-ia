import { randomBytes, createHmac, timingSafeEqual } from "crypto"

const SECRET = process.env.NEXTAUTH_SECRET ?? "fallback-dev-secret-change-me"

export function generateCsrfToken(): string {
    const random = randomBytes(32).toString("hex")
    const sig = createHmac("sha256", SECRET).update(random).digest("hex")
    return `${random}.${sig}`
}

export function verifyCsrfToken(token: string): boolean {
    const parts = token.split(".")
    if (parts.length !== 2) return false
    const [random, sig] = parts
    const expected = createHmac("sha256", SECRET).update(random).digest("hex")
    try {
        return timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))
    } catch {
        return false
    }
}

export const CSRF_COOKIE = "__Host-csrf"
export const CSRF_HEADER = "x-csrf-token"