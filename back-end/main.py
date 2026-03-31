from core.agent import respond

print("Chat iniciado! (digite 'sair')\n")

while True:
    msg = input("Você: ")

    if msg.lower() == "sair":
        print("IA: Tchau!")
        break

    print("IA:", respond(msg))