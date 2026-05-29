import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch

from api.app import app

client = TestClient(app, raise_server_exceptions=False)

MOCK_REPLY = "Olá! Como posso ajudar?"


def _mock_respond(agent, message):
    return MOCK_REPLY


@pytest.fixture(autouse=True)
def patch_respond():
    with patch("api.app.respond", side_effect=_mock_respond):
        yield


# --- /health ---
def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "healthy"


# --- /agents ---
def test_list_agents():
    r = client.get("/agents")
    assert r.status_code == 200
    ids = [a["id"] for a in r.json()["agents"]]
    assert set(ids) == {"lucy", "jouli", "ricki"}


# --- /sessions ---
def test_create_session():
    r = client.post("/sessions", json={"agent": "lucy"})
    assert r.status_code == 201
    data = r.json()
    assert "session_id" in data
    assert data["agent"] == "lucy"


def test_create_session_invalid_agent():
    r = client.post("/sessions", json={"agent": "ghost"})
    assert r.status_code == 400


def test_get_session_not_found():
    r = client.get("/sessions/00000000-0000-0000-0000-000000000000")
    assert r.status_code == 404


def test_delete_session():
    r = client.post("/sessions", json={"agent": "jouli"})
    sid = r.json()["session_id"]
    assert client.delete(f"/sessions/{sid}").status_code == 204
    assert client.get(f"/sessions/{sid}").status_code == 404


# --- /chat ---
def test_chat_creates_session():
    r = client.post("/chat", json={"message": "oi", "agent": "lucy"})
    assert r.status_code == 200
    data = r.json()
    assert data["response"] == MOCK_REPLY
    assert data["agent"] == "lucy"
    assert "session_id" in data


def test_chat_reuses_session():
    r1 = client.post("/chat", json={"message": "oi", "agent": "lucy"})
    sid = r1.json()["session_id"]

    r2 = client.post("/chat", json={"message": "tudo bem?", "agent": "lucy", "session_id": sid})
    assert r2.status_code == 200
    assert r2.json()["session_id"] == sid


def test_chat_history():
    r = client.post("/chat", json={"message": "oi", "agent": "lucy"})
    sid = r.json()["session_id"]
    client.post("/chat", json={"message": "como vai?", "agent": "lucy", "session_id": sid})

    history = client.get(f"/sessions/{sid}/history").json()["history"]
    assert len(history) == 4  # user+assistant × 2
    assert history[0]["role"] == "user"
    assert history[1]["role"] == "assistant"


def test_chat_empty_message():
    r = client.post("/chat", json={"message": "  ", "agent": "lucy"})
    assert r.status_code == 400


def test_chat_invalid_agent():
    r = client.post("/chat", json={"message": "oi", "agent": "fake"})
    assert r.status_code == 400


def test_chat_wrong_agent_for_session():
    r = client.post("/sessions", json={"agent": "lucy"})
    sid = r.json()["session_id"]
    r2 = client.post("/chat", json={"message": "oi", "agent": "ricki", "session_id": sid})
    assert r2.status_code == 400