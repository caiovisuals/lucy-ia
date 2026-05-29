import pytest
from core.session import SessionStore

def test_create_and_get():
    store = SessionStore()
    s = store.create("lucy")
    assert s.id
    assert s.agent == "lucy"
    assert store.get(s.id) is s

def test_history_appends():
    store = SessionStore()
    s = store.create("jouli")
    s.add("user", "oi")
    s.add("assistant", "olá")
    assert len(s.history) == 2
    assert list(s.history)[0].role == "user"
    assert list(s.history)[1].content == "olá"

def test_history_max_length():
    store = SessionStore()
    s = store.create("lucy")
    for i in range(60):
        s.add("user", f"msg {i}")
    assert len(s.history) == 50  # MAX_HISTORY

def test_delete():
    store = SessionStore()
    s = store.create("ricki")
    assert store.delete(s.id) is True
    assert store.get(s.id) is None
    assert store.delete(s.id) is False

def test_to_dict():
    store = SessionStore()
    s = store.create("lucy")
    s.add("user", "hello")
    d = s.to_dict()
    assert d["id"] == s.id
    assert d["agent"] == "lucy"
    assert len(d["history"]) == 1
    assert d["history"][0]["role"] == "user"