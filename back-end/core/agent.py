import pickle
import random
from utils.preprocessor import normalize

with open("model/model.pkl", "rb") as f:
    model = pickle.load(f)

with open("model/vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)

answers = {
    "saudacao": ["Oi!", "Olá!", "E aí!", "Como vai?", "Oii, como você vai?"],
    "nome": ["Sou um chat IA simples chamada Lucy", "Me chamam de Lucy Bot!", "Sou Lucy, a sua IA!"],
    "ajuda": [
        "Claro, posso te ajudar! O que você precisa?",
        "Estou aqui pra isso! Me conta o que aconteceu.",
        "Pode falar, vou tentar te ajudar"
    ],
    "agradecimento": [
        "De nada!",
        "Disponha!",
        "Fico feliz em ajudar!"
    ],
    "pergunta_geral": [
        "Boa pergunta! Ainda estou aprendendo, mas posso tentar responder.",
        "Hmm, deixa eu pensar...",
        "Não tenho certeza, mas vamos descobrir juntos!"
    ],
    "despedida": ["Tchau!", "Até mais!", "A gente se vê!"]
}

def responder(message):
    message = normalize(message)
    vetor = vectorizer.transform([message])
    intent = model.predict(vetor)[0]

    return random.choice(answers.get(intent, ["Perdão. Não entendi"]))