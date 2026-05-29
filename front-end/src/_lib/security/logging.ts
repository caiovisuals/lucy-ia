import { prisma } from "@/_lib/prisma"

export type AuditAction =
    | "login"
    | "login_failed"
    | "logout"
    | "register"
    | "register_failed"
    | "password_change"
    | "oauth_login"
    | "rate_limited"
    | "suspicious_activity"
    | "chat_message"
    | "session_created"
    | "session_deleted"

export interface AuditPayload {
    userId?: string
    action: AuditAction
    resource: string
    ip?: string
    userAgent?: string
    metadata?: Record<string, unknown>
    success?: boolean
}

export async function auditLog(payload: AuditPayload): Promise<void> {
    try {
        await prisma.auditLog.create({
            data: {
                userId: payload.userId ?? null,
                action: payload.action,
                resource: payload.resource,
                ip: payload.ip ?? null,
                userAgent: payload.userAgent ?? null,
                metadata: payload.metadata ? JSON.stringify(payload.metadata) : null,
                success: payload.success ?? true,
            },
        })
    } catch (err) {
        // Never let audit failures crash the app
        console.error("[audit] Failed to write log:", err)
    }
}

export function getClientIp(request: Request): string {
    return (
        request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
        request.headers.get("x-real-ip") ??
        "unknown"
    )
}

export function getUserAgent(request: Request): string {
    return request.headers.get("user-agent") ?? "unknown"
}