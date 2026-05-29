import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/_lib/prisma"
import bcrypt from "bcryptjs"
import { loginSchema } from "@/_lib/validation/schemas"
import { auditLog } from "@/_lib/security/logging"
import { recordFailedAttempt, clearFailedAttempts } from "@/_lib/security/suspicious"

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, req) {
                const ip = req?.headers?.["x-forwarded-for"] ?? req?.headers?.["x-real-ip"] ?? "unknown"
                const ipStr = Array.isArray(ip) ? ip[0] : String(ip)

                const parsed = loginSchema.safeParse(credentials)
                if (!parsed.success) {
                    recordFailedAttempt(ipStr)
                    return null
                }

                const user = await prisma.user.findUnique({
                    where: { email: parsed.data.email },
                    select: { id: true, name: true, email: true, password: true, role: true },
                })

                if (!user || !user.password) {
                    recordFailedAttempt(ipStr)
                    await auditLog({
                        action: "login_failed",
                        resource: "/api/auth/signin",
                        ip: ipStr,
                        metadata: { email: parsed.data.email },
                        success: false,
                    })
                    return null
                }

                const valid = await bcrypt.compare(parsed.data.password, user.password)
                if (!valid) {
                    recordFailedAttempt(ipStr)
                    await auditLog({
                        userId: user.id,
                        action: "login_failed",
                        resource: "/api/auth/signin",
                        ip: ipStr,
                        success: false,
                    })
                    return null
                }

                clearFailedAttempts(ipStr)
                await auditLog({
                    userId: user.id,
                    action: "login",
                    resource: "/api/auth/signin",
                    ip: ipStr,
                    success: true,
                })

                return { id: user.id, name: user.name ?? "", email: user.email }
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: { prompt: "consent", access_type: "offline", response_type: "code" },
            },
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (token && session.user) {
                (session.user as { id?: string }).id = token.id as string
            }
            return session
        },
        async signIn({ user, account }) {
            if (account?.provider !== "credentials" && user?.email) {
                await auditLog({
                    userId: user.id,
                    action: "oauth_login",
                    resource: "/api/auth/signin",
                    metadata: { provider: account?.provider },
                    success: true,
                })
            }
            return true
        },
    },
    events: {
        async signOut({ token }) {
            await auditLog({
                userId: token?.id as string | undefined,
                action: "logout",
                resource: "/api/auth/signout",
                success: true,
            })
        },
    },
}