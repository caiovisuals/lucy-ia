import argparse
import importlib
import os
import pickle
import sys

import torch

from core.vocab import Vocab
from core.model import build_model
from core.trainer import train


def run(agent_name: str, epochs: int, lr: float):
    print(f"\n=== Treinando agente: {agent_name.upper()} ===")

    dataset_module = importlib.import_module(f"agents.{agent_name}.dataset")
    pairs: list[tuple[str, str]] = dataset_module.PAIRS

    vocab = Vocab()
    for src, trg in pairs:
        vocab.add_sentence(src)
        vocab.add_sentence(trg)

    print(f"  Vocabulário: {len(vocab)} palavras | Pares: {len(pairs)}")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"  Dispositivo: {device}")

    model = build_model(len(vocab), device)

    final_loss = train(model, pairs, vocab, epochs=epochs, lr=lr, verbose=True)
    print(f"  Loss final: {final_loss:.4f}")

    save_dir = os.path.join("agents", agent_name, "model")
    os.makedirs(save_dir, exist_ok=True)

    torch.save(model.state_dict(), os.path.join(save_dir, "model.pt"))
    with open(os.path.join(save_dir, "vocab.pkl"), "wb") as f:
        pickle.dump(vocab, f)

    print(f"  Salvo em: {save_dir}/")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--agent", required=True, choices=["lucy", "jouli", "ricki"])
    parser.add_argument("--epochs", type=int, default=300)
    parser.add_argument("--lr", type=float, default=0.001)
    args = parser.parse_args()

    run(args.agent, args.epochs, args.lr)