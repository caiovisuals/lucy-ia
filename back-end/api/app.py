from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from core.agent_runner import respond, AGENTS

app = FastAPI(title="Lucy IA API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    agent: str = "lucy"


class ChatResponse(BaseModel):
    response: str
    agent: str


@app.get("/")
def root():
    return {"status": "ok", "agents": list(AGENTS)}


@app.get("/agents")
def list_agents():
    return {
        "agents": [
            {"id": "lucy", "name": "Lucy", "description": "Conversa empática e suporte emocional"},
            {"id": "jouli", "name": "Jouli", "description": "Professora — explica qualquer assunto"},
            {"id": "ricki", "name": "Ricki", "description": "Dev — análise de código e programação"},
        ]
    }


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    if req.agent not in AGENTS:
        raise HTTPException(status_code=400, detail=f"Agente inválido. Use: {list(AGENTS)}")

    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Mensagem não pode ser vazia.")

    try:
        reply = respond(req.agent, req.message)
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))

    return ChatResponse(response=reply, agent=req.agent)