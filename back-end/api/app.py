import logging
import time
from collections import defaultdict
from threading import Lock

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from core.agent_runner import respond, AGENTS
from core.session import store as session_store

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
logger = logging.getLogger("lucy")

app = FastAPI(title="Lucy IA API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

RATE_LIMIT = 30       # requests
RATE_WINDOW = 60      # segundos
_rate_counters: dict[str, list[float]] = defaultdict(list)
_rate_lock = Lock()


def _check_rate(ip: str):
    now = time.monotonic()
    with _rate_lock:
        timestamps = _rate_counters[ip]
        _rate_counters[ip] = [t for t in timestamps if now - t < RATE_WINDOW]
        if len(_rate_counters[ip]) >= RATE_LIMIT:
            raise HTTPException(status_code=429, detail="Muitas requisições. Tente novamente em breve.")
        _rate_counters[ip].append(now)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    ip = request.client.host if request.client else "unknown"
    _check_rate(ip)
    response: Response = await call_next(request)
    duration_ms = (time.perf_counter() - start) * 1000
    logger.info("%s %s %d %.1fms [%s]", request.method, request.url.path, response.status_code, duration_ms, ip)
    return response

class ChatRequest(BaseModel):
    message: str
    agent: str = "lucy"
    session_id: str | None = None


class ChatResponse(BaseModel):
    response: str
    agent: str
    session_id: str

class SessionCreateRequest(BaseModel):
    agent: str = "lucy"


@app.get("/")
def root():
    return {"status": "ok", "version": "1.0.0", "agents": list(AGENTS)}

@app.get("/health")
def health():
    return {"status": "healthy", "timestamp": time.time()}

@app.get("/agents")
def list_agents():
    return {
        "agents": [
            {"id": "lucy", "name": "Lucy", "description": "Conversa empática e suporte emocional"},
            {"id": "jouli", "name": "Jouli", "description": "Professora — explica qualquer assunto"},
            {"id": "ricki", "name": "Ricki", "description": "Dev — análise de código e programação"},
        ]
    }

@app.post("/sessions", status_code=201)
def create_session(body: SessionCreateRequest):
    if body.agent not in AGENTS:
        raise HTTPException(status_code=400, detail=f"Agente inválido. Use: {list(AGENTS)}")
    session = session_store.create(body.agent)
    logger.info("Nova sessão criada: %s (agente=%s)", session.id, session.agent)
    return {"session_id": session.id, "agent": session.agent, "created_at": session.created_at}

@app.get("/sessions/{session_id}")
def get_session(session_id: str):
    session = session_store.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada.")
    return session.to_dict()


@app.delete("/sessions/{session_id}", status_code=204)
def delete_session(session_id: str):
    if not session_store.delete(session_id):
        raise HTTPException(status_code=404, detail="Sessão não encontrada.")
    logger.info("Sessão encerrada: %s", session_id)


@app.get("/sessions/{session_id}/history")
def get_history(session_id: str):
    session = session_store.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada.")
    return {"session_id": session_id, "agent": session.agent, "history": [
        {"role": m.role, "content": m.content, "timestamp": m.timestamp}
        for m in session.history
    ]}

@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    if req.agent not in AGENTS:
        raise HTTPException(status_code=400, detail=f"Agente inválido. Use: {list(AGENTS)}")

    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Mensagem não pode ser vazia.")
    
    if req.session_id:
        session = session_store.get(req.session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Sessão não encontrada.")
        if session.agent != req.agent:
            raise HTTPException(status_code=400, detail=f"Sessão pertence ao agente '{session.agent}', não '{req.agent}'.")
    else:
        session = session_store.create(req.agent)

    try:
        reply = respond(req.agent, req.message)
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))

    session.add("user", req.message)
    session.add("assistant", reply)

    logger.info("Chat [%s/%s] user=%r reply=%r", session.id[:8], req.agent, req.message[:60], reply[:60])
    return ChatResponse(response=reply, agent=req.agent, session_id=session.id)