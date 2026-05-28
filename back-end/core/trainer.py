import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader

from core.vocab import Vocab, SOS_IDX, EOS_IDX, PAD_IDX
from core.model import Seq2Seq


class ConversationDataset(Dataset):
    def __init__(self, pairs: list[tuple[str, str]], vocab: Vocab, max_len: int = 50):
        self.samples = []
        for src_text, trg_text in pairs:
            src = vocab.encode(src_text)
            trg = [SOS_IDX] + vocab.encode(trg_text) + [EOS_IDX]
            src = src[:max_len]
            trg = trg[:max_len + 2]
            self.samples.append((src, trg))

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        return self.samples[idx]


def collate_fn(batch):
    srcs, trgs = zip(*batch)

    src_lens = [len(s) for s in srcs]
    trg_lens = [len(t) for t in trgs]

    max_src = max(src_lens)
    max_trg = max(trg_lens)

    src_padded = [s + [PAD_IDX] * (max_src - len(s)) for s in srcs]
    trg_padded = [t + [PAD_IDX] * (max_trg - len(t)) for t in trgs]

    return (
        torch.tensor(src_padded, dtype=torch.long),
        torch.tensor(trg_padded, dtype=torch.long),
    )


def train(
    model: Seq2Seq,
    pairs: list[tuple[str, str]],
    vocab: Vocab,
    epochs: int = 200,
    lr: float = 0.001,
    batch_size: int = 16,
    teacher_forcing_ratio: float = 0.5,
    verbose: bool = True,
) -> float:
    dataset = ConversationDataset(pairs, vocab)
    loader = DataLoader(dataset, batch_size=batch_size, shuffle=True, collate_fn=collate_fn)

    optimizer = torch.optim.Adam(model.parameters(), lr=lr)
    criterion = nn.CrossEntropyLoss(ignore_index=PAD_IDX)

    model.train()
    final_loss = 0.0

    for epoch in range(1, epochs + 1):
        total_loss = 0.0
        for src, trg in loader:
            src, trg = src.to(model.device), trg.to(model.device)
            optimizer.zero_grad()
            output = model(src, trg, teacher_forcing_ratio)

            # output: (batch, trg_len, vocab) → flatten skipping <SOS>
            out = output[:, 1:].reshape(-1, output.shape[-1])
            tgt = trg[:, 1:].reshape(-1)

            loss = criterion(out, tgt)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            total_loss += loss.item()

        avg_loss = total_loss / len(loader)
        final_loss = avg_loss

        if verbose and epoch % 20 == 0:
            print(f"  Epoch {epoch:>4}/{epochs}  loss={avg_loss:.4f}")

    return final_loss