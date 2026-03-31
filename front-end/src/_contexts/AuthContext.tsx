"use client"

import { createContext, useContext } from "react"
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react"
import type { Session } from "next-auth"

type AuthContextType = {
    session: Session | null
    status: "loading" | "authenticated" | "unauthenticated"
    login: () => void
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <AuthProviderInternal>{children}</AuthProviderInternal>
        </SessionProvider>
    )
}

function AuthProviderInternal({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()

    const login = () => {
        signIn()
    }

    const logout = () => {
        signOut()
    }

    return (
        <AuthContext.Provider
            value={{
                session,
                status,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error("useAuth deve ser usado dentro de um AuthProvider")
    }

    return context
}