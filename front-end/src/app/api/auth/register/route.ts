import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/_lib/prisma"
import { registerSchema } from "@/_lib/validation/schemas"
import { checkRateLimit, rateLimitResponse, jsonError } from "@/_lib/security/requestHelpers"
import { RATE_LIMITS } from "@/_lib/security/rateLimit"
import { auditLog, getClientIp, getUserAgent } from "@/_lib/security/logging"
import { isSuspicious, recordFailedAttempt } from "@/_lib/security/suspicious"

export async function POST(request: NextRequest) {
    const ip = getClientIp(request)
    const userAgent = getUserAgent(request)

    const suspiciousCheck = isSuspicious(ip)
    if (suspiciousCheck.blocked) {
        return jsonError("Conta temporariamente bloqueada. Tente novamente mais tarde.", 403, {
            retryAfterMs: suspiciousCheck.lockRemainingMs,
        })
    }

    const rl = checkRateLimit(request, RATE_LIMITS.register)
    if (!rl.success) return rateLimitResponse(rl)

    let body: unknown
    try {
        body = await request.json()
    } catch {
        return jsonError("Corpo da requisição inválido.", 400)
    }

    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
        return jsonError("Dados inválidos.", 422, {
            issues: parsed.error.issues.map((i) => ({ field: i.path[0], message: i.message })),
        })
    }

    const { name, username, email, password } = parsed.data

    const existing = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
        select: { email: true, username: true },
    })

    if (existing) {
        recordFailedAttempt(ip)
        const field = existing.email === email ? "email" : "username"
        await auditLog({
            action: "register_failed",
            resource: "/api/auth/register",
            ip,
            userAgent,
            metadata: { reason: `${field}_taken` },
            success: false,
        })
        return jsonError(
            field === "email" ? "Este email já está em uso." : "Este nome de usuário já está em uso.",
            409
        )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
        data: { name, username, email, password: hashedPassword },
        select: { id: true, name: true, username: true, email: true, createdAt: true },
    })

    await auditLog({
        userId: user.id,
        action: "register",
        resource: "/api/auth/register",
        ip,
        userAgent,
        success: true,
    })

    return NextResponse.json({ user }, { status: 201 })
}