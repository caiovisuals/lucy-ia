import re
import unicodedata

PAD = "<PAD>"
SOS = "<SOS>"
EOS = "<EOS>"
UNK = "<UNK>"

PAD_IDX = 0
SOS_IDX = 1
EOS_IDX = 2
UNK_IDX = 3


def normalize(text: str) -> str:
    text = text.lower().strip()
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


class Vocab:
    def __init__(self):
        self.word2idx = {PAD: PAD_IDX, SOS: SOS_IDX, EOS: EOS_IDX, UNK: UNK_IDX}
        self.idx2word = {v: k for k, v in self.word2idx.items()}

    def add_sentence(self, sentence: str):
        for word in normalize(sentence).split():
            if word not in self.word2idx:
                idx = len(self.word2idx)
                self.word2idx[word] = idx
                self.idx2word[idx] = word

    def encode(self, sentence: str) -> list[int]:
        return [self.word2idx.get(w, UNK_IDX) for w in normalize(sentence).split()]

    def decode(self, indices: list[int]) -> str:
        words = []
        for idx in indices:
            word = self.idx2word.get(idx, UNK)
            if word in (EOS, PAD, SOS):
                break
            words.append(word)
        return " ".join(words)

    def __len__(self) -> int:
        return len(self.word2idx)