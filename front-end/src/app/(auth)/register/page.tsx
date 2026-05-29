"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { registerSchema } from "@/_lib/validation/schemas"

export default function Register() {
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState("")
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    const [error, setError] = useState<string | null>(null)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

    const showPasswordIcon = () => {
        if (showPassword) {
            return (
                <>
                <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                <circle cx="12" cy="12" r="3"></circle>
                </>
            )
        } else {
            return (
                <>
                    <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"></path>
                    <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"></path>
                    <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"></path>
                    <path d="m2 2 20 20"></path>
                </>
            )
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setFieldErrors({})

        const parsed = registerSchema.safeParse({ name, username, email, password })
        if (!parsed.success) {
            const errs: Record<string, string> = {}
            for (const issue of parsed.error.issues) {
                const field = String(issue.path[0])
                if (!errs[field]) errs[field] = issue.message
            }
            setFieldErrors(errs)
            return
        }

        if (password !== confirmPassword) {
            setFieldErrors({ confirmPassword: "As senhas não coincidem." })
            return
        }

        setLoading(true)

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({name, username, email, password})
            })

            const data = await response.json()

            if (!response.ok) {
                if (data.issues) {
                    const errs: Record<string, string> = {}
                    for (const issue of data.issues) {
                        errs[String(issue.field)] = issue.message
                    }
                    setFieldErrors(errs)
                } else {
                    setError(data.error ?? "Erro ao criar conta.")
                }
                setLoading(false)
                return
            }

            const result = await signIn("credentials", { email, password, redirect: false })
            if (result?.error) {
                window.location.href = "/login"
            } else {
                window.location.href = "/"
            }
        } catch {
            setError("Erro de conexão. Tente novamente.")
            setLoading(false)
        }
    }

    const handleOAuth = (provider: "google" | "facebook") => {
        signIn(provider, { callbackUrl: "/" })
    }

    const FieldError = ({ field }: { field: string }) =>
        fieldErrors[field] ? (
            <span className="text-red-400 text-[13px] mt-[-3px]">{fieldErrors[field]}</span>
        ) : null

    return (
        <div className="size-full flex flex-col justify-center items-center px-[22px]">
            <h1 className="text-[35px] mb-[15px]">Criar Conta</h1>
            {error && (
                <div className="w-full max-w-[500px] mb-4 p-3 bg-red-900/40 border border-red-600 rounded-[10px] text-red-300 text-[15px]">
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-[10px] items-center max-w-[500px]">
                <div className="flex flex-col gap-[3px] w-full">
                    <label htmlFor="name" className="text-[20px]">
                        Nome
                    </label>
                    <input
                    id="name"
                    type="text"
                    placeholder="Digite seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border-2 bg-[#333] border-[#444] p-[5px] px-[11.25px] text-[18px] text-[white] rounded-[15px] outline-none focus:border-[#555] transition-all duration-300 ease-in-out"
                    required
                    minLength={3}
                    maxLength={50}
                    />
                </div>

                <div className="flex flex-col gap-[3px] w-full">
                    <label htmlFor="name" className="text-[20px]">
                        Nome de usuário
                    </label>
                    <input
                    id="username"
                    type="text"
                    placeholder="Digite seu nome de usuário"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full border-2 bg-[#333] border-[#444] p-[5px] px-[11.25px] text-[18px] text-[white] rounded-[15px] outline-none focus:border-[#555] transition-all duration-300 ease-in-out"
                    required
                    minLength={3}
                    maxLength={30}
                    />
                </div>

                <div className="flex flex-col gap-[3px] w-full">
                    <label htmlFor="email" className="text-[20px]">
                        E-mail
                    </label>
                    <input
                    id="email"
                    type="text"
                    placeholder="Digite seu e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border-2 bg-[#333] border-[#444] p-[5px] px-[11.25px] text-[18px] text-[white] rounded-[15px] outline-none focus:border-[#555] transition-all duration-300 ease-in-out"
                    required
                    />
                </div>

                <div className="flex flex-col gap-[3px] w-full relative">
                    <label htmlFor="password" className="text-[20px]">
                        Senha
                    </label>
                    <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border-2 bg-[#333] border-[#444] p-[5px] px-[11.25px] text-[18px] text-[white] rounded-[15px] outline-none focus:border-[#555] transition-all duration-300 ease-in-out"
                    required
                    />
                    <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-[10px] top-[41.5px] flex items-center justify-center bg-transparent outline-none"
                    tabIndex={-1}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            width={24}
                            height={24}
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            >
                            {showPasswordIcon()}
                        </svg>
                    </button>
                </div>

                <div className="flex flex-col gap-[3px] w-full relative">
                    <label htmlFor="confirmPassword" className="text-[20px]">
                        Confirmar Senha
                    </label>
                    <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirme sua senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border-2 bg-[#333] border-[#444] p-[5px] px-[11.25px] text-[18px] text-[white] rounded-[15px] outline-none focus:border-[#555] transition-all duration-300 ease-in-out"
                    required
                    />
                </div>

                <button
                    type="submit"
                    className={`w-min text-black bg-gray-300 hover:text-white hover:bg-gray-600 text-[20px] p-[7.5px] px-[90px] mt-[15px] rounded-[15px] transition-all duration-300 ease-in-out cursor-pointer whitespace-nowrap outline-none`}
                    disabled={loading}>
                    {loading ? "Criando Conta" : "Criar Conta"}
                </button>

                <p className="text-center mt-[-5px]">
                    Já tem uma conta?{" "}
                    <a href="/login" className="text-gray-500">
                    Fazer login
                    </a>
                </p>
            </form>
            <div className="absolute bottom-0 items-center justify-center w-full flex mb-1">
                <span className="text-[10px] font-[300] text-center">Ao criar sua conta no RICKI, você concorda com os <a href="/terms" className="text-gray-700 hover:text-gray-800 transition cursor-pointer">Termos e a Política de Privacidade.</a></span>
            </div>
        </div>
    )
}
