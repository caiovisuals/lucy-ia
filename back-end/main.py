import sys
import uvicorn

from core.agent_runner import respond

def run_cli():
    agent = "lucy"
    if len(sys.argv) > 1 and sys.argv[1] in ("lucy", "jouli", "ricki"):
        agent = sys.argv[1]

    print(f"Chat com {agent.upper()} iniciado! (digite 'sair')\n")

    while True:
        try:
            msg = input("Você: ")

            if msg.lower() in ["sair", "exit", "quit"]:
                print(f"{agent.upper()}: Tchau!")
                break

            print(f"{agent.upper()}:", respond(agent, msg))

        except KeyboardInterrupt:
            print("\nEncerrando...")
            break


if __name__ == "__main__":
    if "--serve" in sys.argv:
        uvicorn.run("api.app:app", host="0.0.0.0", port=8000, reload=True)
    else:
        run_cli()