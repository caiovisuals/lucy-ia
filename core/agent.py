import pickle
import random

# carregar modelo
with open("model/model.pkl", "rb") as f:
    model = pickle.load(f)

with open("model/vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)

respostas = {
    "saudacao": ["Oi!", "Olá!", "E aí!"],
    "nome": ["Sou um chat IA simples 😄"],
    "despedida": ["Tchau!", "Até mais!"]
}

def responder(mensagem):
    vetor = vectorizer.transform([mensagem])
    intent = model.predict(vetor)[0]

    return random.choice(respostas.get(intent, ["Não entendi 🤔"]))