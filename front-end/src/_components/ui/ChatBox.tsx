"use client"

type Message = {
    sender: "user" | "ia"
    content: string
}

type Props = {
    messages: Message[]
}

export default function ChatBox({ messages }: Props) {
    return (
        <div className="flex flex-col gap-4 pb-4">
            {messages.map((msg, i) => (
                <div
                    key={i}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                    <div
                        className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                            msg.sender === "user"
                                ? "bg-[var(--orange)] text-[var(--white-text)] rounded-br-sm"
                                : "bg-[var(--foreground)] rounded-bl-sm"
                        }`}
                    >
                        {msg.content}
                    </div>
                </div>
            ))}
        </div>
    )
}