"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import ChatInput from "@/_components/ui/ChatInput"
import type { AgentId } from "@/_lib/services/api"

const defaultSuggestions = [
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
    
    const [suggestions] = useState(() => {
        return [...defaultSuggestions]
            .sort(() => Math.random() - 0.5)
            .slice(0, 4)
    })
    
    const [inputValue, setInputValue] = useState("")
    const [selectedAgent, setSelectedAgent] = useState<AgentId>("lucy")
    
    const handleSend = (message: string) => {
        if (!message.trim()) return
        router.push(`/chat?task=${encodeURIComponent(message)}&agent=${selectedAgent}`)
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-animated-gradient">
            <div className="w-[80%] lg:w-[60%] max-w-300 flex flex-col justify-center gap-y-3 xl:gap-y-5">
                <h1 className="text-5xl">Olá, <span className="font-bold">Caio</span></h1>
                <div className="flex flex-col gap-3">
                    <ChatInput onSend={handleSend} type="home" text={inputValue} setText={setInputValue} />
                    <div className="hidden flex-row flex-wrap items-center justify-start gap-2 lg:flex">
                        {suggestions.map((s, i) => (
                            <div key={i} onClick={() => setInputValue(s)} className="px-4 py-1.5 rounded-lg border-2 border-[var(--border)] bg-[var(--background)] hover:bg-[var(--foreground)]/50 transition-normal whitespace-nowrap cursor-pointer text-sm">
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
