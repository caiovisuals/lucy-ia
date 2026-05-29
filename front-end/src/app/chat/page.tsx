"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect, useRef, Suspense } from "react"
import ChatBox from "@/_components/ui/ChatBox"
import ChatInput from "@/_components/ui/ChatInput"
import { sendMessage, createChatSession, saveChatMessage, type AgentId } from "@/_lib/services/api"

type Message = {
    sender: "user" | "ia"
    content: string
}

type Conversation = {
    id: string
    task: string
    agent: AgentId
    messages: Message[]
}

const AGENT_NAMES: Record<AgentId, string> = {
    lucy: "Lucy",
    jouli: "Jouli",
    ricki: "Ricki",
}

function ChatPageContent() {
    const searchParams = useSearchParams()
    const task = searchParams.get("task") || "Olá"
    const agent = (searchParams.get("agent") as AgentId) || "lucy"

    const [inputValue, setInputValue] = useState("")
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [activeId, setActiveId] = useState<string | null>(null)
    const [dbSessionId, setDbSessionId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const initConversation = async () => {
            const id = Date.now().toString()
            setIsLoading(true)

            let response = "..."
            let newDbSessionId: string | null = null
            try {
                const dbSession = await createChatSession(agent)
                newDbSessionId = dbSession.id
                setDbSessionId(dbSession.id)
            } catch {
                // non-blocking: continue even if DB session creation fails
            }

            try {
                response = await sendMessage(task, agent)
            } catch {
                response = "Não consegui me conectar. Verifique se o servidor está rodando."
            } finally {
                setIsLoading(false)
            }

            if (newDbSessionId) {
                try {
                    await saveChatMessage(newDbSessionId, "user", task)
                    await saveChatMessage(newDbSessionId, "assistant", response)
                } catch {
                    // non-blocking
                }
            }

            const newConv: Conversation = {
                id,
                task,
                agent,
                messages: [
                    { sender: "user", content: task },
                    { sender: "ia", content: response },
                ],
            }

            if (dbSessionId) {
            try {
                await saveChatMessage(dbSessionId, "user", message)
                await saveChatMessage(dbSessionId, "assistant", response)
            } catch {
                // non-blocking
            }
        }

            setConversations([newConv])
            setActiveId(id)
        }

        initConversation()
    }, [])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [conversations, isLoading])

    const activeConversation = conversations.find((c) => c.id === activeId)

    const handleSend = async (message: string) => {
        if (!activeId || !message.trim()) return

        setConversations((prev) =>
            prev.map((conv) =>
                conv.id === activeId
                    ? { ...conv, messages: [...conv.messages, { sender: "user", content: message }] }
                    : conv
            )
        )

        setIsLoading(true)
        let response = "..."

        try {
            response = await sendMessage(message, activeConversation?.agent ?? agent)
        } catch {
            response = "Ocorreu um erro ao contatar a IA. Tente novamente."
        } finally {
            setIsLoading(false)
        }

        setConversations((prev) =>
            prev.map((conv) =>
                conv.id === activeId
                    ? { ...conv, messages: [...conv.messages, { sender: "ia", content: response }] }
                    : conv
            )
        )
    }

    return (
        <div className="relative flex flex-col flex-grow rounded p-4 pt-8 gap-4 overflow-hidden h-full">
            {activeConversation ? (
                <div className="flex flex-col justify-between h-full">
                    <div className="flex-grow overflow-y-auto pr-1">
                        <ChatBox messages={activeConversation.messages} />
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-[var(--foreground)] px-4 py-3 rounded-2xl rounded-bl-sm text-sm opacity-60">
                                    {AGENT_NAMES[activeConversation.agent]} está digitando...
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>
                    <ChatInput
                        onSend={handleSend}
                        type="conversation"
                        text={inputValue}
                        setText={setInputValue}
                    />
                </div>
            ) : (
                <div className="flex items-center justify-center h-full opacity-50">
                    <p>Iniciando conversa...</p>
                </div>
            )}
            <div className="absolute top-0 flex items-center justify-center w-full">
                <span className="text-[12px] font-[300] text-center">
                    {AGENT_NAMES[agent]} pode cometer erros. Lembre-se de verificar informações importantes.
                </span>
            </div>
        </div>
    )
}

export default function ChatPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-full opacity-50">Carregando...</div>}>
            <ChatPageContent />
        </Suspense>
    )
}