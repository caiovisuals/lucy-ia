import torch
import torch.nn as nn
import random

from core.vocab import SOS_IDX, EOS_IDX, PAD_IDX


class Encoder(nn.Module):
    def __init__(self, vocab_size: int, embed_dim: int, hidden_dim: int, n_layers: int, dropout: float):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=PAD_IDX)
        self.lstm = nn.LSTM(embed_dim, hidden_dim, n_layers, dropout=dropout, batch_first=True)
        self.dropout = nn.Dropout(dropout)

    def forward(self, src):
        embedded = self.dropout(self.embedding(src))
        _, (hidden, cell) = self.lstm(embedded)
        return hidden, cell


class Decoder(nn.Module):
    def __init__(self, vocab_size: int, embed_dim: int, hidden_dim: int, n_layers: int, dropout: float):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=PAD_IDX)
        self.lstm = nn.LSTM(embed_dim, hidden_dim, n_layers, dropout=dropout, batch_first=True)
        self.fc_out = nn.Linear(hidden_dim, vocab_size)
        self.dropout = nn.Dropout(dropout)

    def forward(self, token, hidden, cell):
        token = token.unsqueeze(1)
        embedded = self.dropout(self.embedding(token))
        output, (hidden, cell) = self.lstm(embedded, (hidden, cell))
        prediction = self.fc_out(output.squeeze(1))
        return prediction, hidden, cell


class Seq2Seq(nn.Module):
    def __init__(self, encoder: Encoder, decoder: Decoder, device: torch.device):
        super().__init__()
        self.encoder = encoder
        self.decoder = decoder
        self.device = device

    def forward(self, src, trg, teacher_forcing_ratio: float = 0.5):
        batch_size, trg_len = trg.shape
        vocab_size = self.decoder.fc_out.out_features

        outputs = torch.zeros(batch_size, trg_len, vocab_size).to(self.device)
        hidden, cell = self.encoder(src)

        token = trg[:, 0]  # <SOS>

        for t in range(1, trg_len):
            output, hidden, cell = self.decoder(token, hidden, cell)
            outputs[:, t] = output
            teacher_force = random.random() < teacher_forcing_ratio
            token = trg[:, t] if teacher_force else output.argmax(1)

        return outputs

    @torch.no_grad()
    def generate(self, src_indices: list[int], max_len: int = 60) -> list[int]:
        self.eval()
        src = torch.tensor([src_indices], dtype=torch.long).to(self.device)
        hidden, cell = self.encoder(src)

        token = torch.tensor([SOS_IDX], dtype=torch.long).to(self.device)
        result = []

        for _ in range(max_len):
            output, hidden, cell = self.decoder(token, hidden, cell)
            pred = output.argmax(1).item()
            if pred == EOS_IDX:
                break
            result.append(pred)
            token = torch.tensor([pred], dtype=torch.long).to(self.device)

        return result


def build_model(vocab_size: int, device: torch.device, embed_dim=128, hidden_dim=256, n_layers=2, dropout=0.3) -> Seq2Seq:
    encoder = Encoder(vocab_size, embed_dim, hidden_dim, n_layers, dropout)
    decoder = Decoder(vocab_size, embed_dim, hidden_dim, n_layers, dropout)
    return Seq2Seq(encoder, decoder, device).to(device)