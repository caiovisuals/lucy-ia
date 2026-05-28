import os
import pickle

import torch

from core.vocab import Vocab
from core.model import Seq2Seq, build_model

_cache: dict[str, tuple[Seq2Seq, Vocab]] = {}

AGENTS = ("lucy", "jouli", "ricki")

def _load(agent_name: str) -> tuple[Seq2Seq, Vocab]:
    if agent_name in _cache:
        return _cache[agent_name]

    model_dir = os.path.join("agents", agent_name, "model")
    model_path = os.path.join(model_dir, "model.pt")
    vocab_path = os.path.join(model_dir, "vocab.pkl")

    if not os.path.exists(model_path) or not os.path.exists(vocab_path):
        raise FileNotFoundError(
            f"Modelo do agente '{agent_name}' não encontrado. "
            f"Rode: python -m core.train_agent --agent {agent_name}"
        )

    with open(vocab_path, "rb") as f:
        vocab: Vocab = pickle.load(f)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = build_model(len(vocab), device)
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.eval()

    _cache[agent_name] = (model, vocab)
    return model, vocab


def respond(agent_name: str, message: str) -> str:
    if agent_name not in AGENTS:
        raise ValueError(f"Agente desconhecido: {agent_name}. Escolha: {AGENTS}")

    model, vocab = _load(agent_name)
    src_indices = vocab.encode(message)

    if not src_indices:
        return "Pode repetir? Não entendi."

    output_indices = model.generate(src_indices)
    response = vocab.decode(output_indices)

    return response if response.strip() else "Não sei bem como responder isso ainda."