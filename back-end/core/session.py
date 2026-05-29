import uuid
from collections import deque
from dataclasses import dataclass, field
from datetime import datetime, timezone
from threading import Lock

MAX_HISTORY = 50


@dataclass
class Message:
    role: str
    content: str
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


@dataclass
class Session:
    id: str
    agent: str
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    history: deque = field(default_factory=lambda: deque(maxlen=MAX_HISTORY))

    def add(self, role: str, content: str):
        self.history.append(Message(role=role, content=content))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "agent": self.agent,
            "created_at": self.created_at,
            "history": [{"role": m.role, "content": m.content, "timestamp": m.timestamp} for m in self.history],
        }


class SessionStore:
    def __init__(self):
        self._sessions: dict[str, Session] = {}
        self._lock = Lock()

    def create(self, agent: str) -> Session:
        session = Session(id=str(uuid.uuid4()), agent=agent)
        with self._lock:
            self._sessions[session.id] = session
        return session

    def get(self, session_id: str) -> Session | None:
        return self._sessions.get(session_id)

    def delete(self, session_id: str) -> bool:
        with self._lock:
            return self._sessions.pop(session_id, None) is not None

    def list_all(self) -> list[dict]:
        with self._lock:
            return [{"id": s.id, "agent": s.agent, "created_at": s.created_at, "messages": len(s.history)} for s in self._sessions.values()]


store = SessionStore()