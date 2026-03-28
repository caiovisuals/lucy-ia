import re
import unicodedata

def normalizar(texto: str) -> str:
    # minúsculas
    texto = texto.lower()
    
    # remove acentos (ó → o, ã → a, etc.)
    texto = unicodedata.normalize("NFD", texto)
    texto = "".join(c for c in texto if unicodedata.category(c) != "Mn")
    
    # remove pontuação e caracteres especiais
    texto = re.sub(r"[^\w\s]", "", texto)
    
    # remove espaços extras
    texto = texto.strip()
    
    return texto