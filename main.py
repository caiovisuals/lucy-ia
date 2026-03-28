from core.agent import responder

print("Chat iniciado! (digite 'sair')\n")

while True:
    msg = input("Você: ")

    if msg.lower() == "sair":
        print("IA: Tchau!")
        break

    print("IA:", responder(msg))