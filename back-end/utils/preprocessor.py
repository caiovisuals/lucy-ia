import re
import unicodedata

def normalize(text: str) -> str:
    # minúsculas
    text = text.lower()
    
    # remove acentos (ó → o, ã → a, etc.)
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    
    # remove pontuação e caracteres especiais
    text = re.sub(r"[^\w\s]", "", text)
    
    # remove espaços extras
    text = text.strip()
    
    return text