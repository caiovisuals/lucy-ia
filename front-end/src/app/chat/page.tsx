"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import ChatBox from "@/_components/ui/ChatBox"
import ChatInput from "@/_components/ui/ChatInput"

type Message = {
    sender: "user" | "ia"
    content: string
}

type Conversation = {
    id: string
    task: string
    messages: Message[]
}

export default function ChatPage() {
    const searchParams = useSearchParams()
    const task = searchParams.get("task") || "Nova conversa"
    const [inputValue, setInputValue] = useState("")

    const [conversations, setConversations] = useState<Conversation[]>([])
    const [activeId, setActiveId] = useState<string | null>(null)

    useEffect(() => {
        if (!activeId) {
            const initConversation = async () => {
                const id = Date.now().toString()
                const response()

                const newConv: Conversation = {
                    id,
                    task,
                    messages: [
                        { sender: "user", content: task },
                        { sender: "ia", content: response }
                    ]
                }

                setConversations([newConv])
                setActiveId(id)
            }

            initConversation()
        }
    }, [activeId, task])

    const activeConversation = conversations.find((c) => c.id === activeId)

    const handleSend = async (mensagem: string) => {
        if (!activeId || !mensagem.trim()) return

        const response()

        setConversations((prev) =>
            prev.map((conv) =>
              conv.id === activeId
                ? {
                    ...conv,
                    messages: [
                      ...conv.messages,
                      { sender: "user", content: mensagem },
                      { sender: "ia", content: response }
                    ]
                  }
                : conv
            )
        )
    }

    return (
        <div className="relative flex flex-col flex-grow rounded p-4 pt-8 gap-4 overflow-hidden h-full">
            {activeConversation ? (
                <div className="flex flex-col justify-between h-full">
                    <div className="flex-grow overflow-y-auto">
                        <ChatBox messages={activeConversation.messages} />
                    </div>
                    <ChatInput onSend={handleSend} type="conversation" text={inputValue} setText={setInputValue}/>
                </div>
            ) : (
                <p>Selecione ou crie uma conversa para começar.</p>
            )}
            <div className="absolute top-0 flex items-center justify-center w-full">
                <span className="text-[12px] font-[300] text-center">O RICKI pode cometer erros ao longo do uso. Por isso, lembre-se de sempre conferir informações relevantes.</span>
            </div>
        </div>
    )
}