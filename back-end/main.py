from core.agent import respond

print("Chat iniciado! (digite 'sair')\n")

while True:
    try:
        msg = input("Você: ")

        if msg.lower() in ["sair", "exit", "quit"]:
            print("IA: Tchau!")
            break

        print("IA:", respond(msg))

    except KeyboardInterrupt:
        print("\nIA: Encerrando...")
        break