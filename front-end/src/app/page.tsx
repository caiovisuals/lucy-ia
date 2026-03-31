"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import ChatInput from "@/_components/ui/ChatInput"

const defaultSuggestions  = [
    "Me ensine sobre finanças",
    "Crie um plano de ação para mim",
    "Me ajude com meu TCC",
    "Monte um site de portfólio",
    "Escreva umas receitas",
    "Monte uma rotina de estudos",
    "Me recomende um livro",
]

export default function Home() {
    const router = useRouter()
    const [inputValue, setInputValue] = useState("")
    const [suggestions, setSuggestions] = useState<string[]>([])

    useEffect(() => {
        const shuffleArray = (array: string[]) => {
            return [...array].sort(() => Math.random() - 0.5)
        }
        setSuggestions(shuffleArray(defaultSuggestions).slice(0, 4))
    }, [])

    const handleSend = (mensagem: string) => {
        if (!mensagem.trim()) return
        router.push(`/chat?task=${encodeURIComponent(mensagem)}`)
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="w-[60%] max-w-300 flex flex-col justify-center gap-y-5">
                <h1 className="text-5xl">Boa tarde, <span className="font-bold">Caio</span></h1>
                <div className="flex flex-col gap-3">
                    <ChatInput onSend={handleSend} type="home" text={inputValue} setText={setInputValue} />
                    <div className="hidden flex-row items-center justify-start gap-2 lg:flex">
                        {suggestions.map((s, i) => (
                            <div key={i} onClick={() => setInputValue(s)} className="px-4 py-1.5 rounded-lg border-2 border-[var(--border)] hover:bg-[var(--foreground)]/50 transition-normal whitespace-nowrap cursor-pointer text-sm">
                                {s}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="absolute bottom-0 flex items-center justify-center w-full mb-1">
                <span className="text-sm text-center">
                    Ao utilizar a Lucy, você concorda com os <Link href="/terms" className="font-semibold transition-normal cursor-pointer">Termos e a Política de Privacidade.</Link>
                </span>
            </div>
        </div>
    )
}
