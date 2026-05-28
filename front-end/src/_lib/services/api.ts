const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export type AgentId = "lucy" | "jouli" | "ricki"

export interface AgentInfo {
    id: AgentId
    name: string
    description: string
}

export async function fetchAgents(): Promise<AgentInfo[]> {
    const res = await fetch(`${API_URL}/agents`)
    if (!res.ok) throw new Error("Erro ao buscar agentes")
    const data = await res.json()
    return data.agents
}

export async function sendMessage(message: string, agent: AgentId): Promise<string> {
    const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, agent }),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail ?? "Erro ao contatar a IA")
    }

    const data = await res.json()
    return data.response as string
}