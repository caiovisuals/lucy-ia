data = [
    {
        "instruction": "Crie uma função em JavaScript que soma dois números",
        "input": "",
        "output": """function sum(a, b) {
  return a + b;
}"""
    },
    {
        "instruction": "Crie uma função em Python que verifica se um número é par",
        "input": "",
        "output": """def is_even(n):
    return n % 2 == 0"""
    },
    {
        "instruction": "Crie um componente React de botão com Tailwind",
        "input": "",
        "output": """export default function Button() {
  return (
    <button className="px-4 py-2 bg-blue-500 text-white rounded">
      Clique aqui
    </button>
  );
}"""
    },
    {
        "instruction": "Explique o que é uma API REST",
        "input": "",
        "output": "Uma API REST é um conjunto de regras que permite a comunicação entre sistemas usando HTTP, geralmente com métodos como GET, POST, PUT e DELETE."
    },
    {
        "instruction": "Crie uma rota GET no Next.js App Router",
        "input": "",
        "output": """export async function GET() {
  return Response.json({ message: "Hello World" });
}"""
    },
    {
        "instruction": "Crie um schema Prisma para usuário com nome e email",
        "input": "",
        "output": """model User {
  id    String @id @default(uuid())
  name  String
  email String @unique
}"""
    },
    {
        "instruction": "Crie uma função em JavaScript que faz debounce",
        "input": "",
        "output": """function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}"""
    },
    {
        "instruction": "Crie um endpoint POST em Express",
        "input": "",
        "output": """app.post('/api/data', (req, res) => {
  const body = req.body;
  res.json({ received: body });
});"""
    },
    {
        "instruction": "Crie uma função em Python para ler um arquivo JSON",
        "input": "",
        "output": """import json

def read_json(path):
    with open(path, 'r') as f:
        return json.load(f)"""
    },
    {
        "instruction": "Crie um hook customizado em React para contador",
        "input": "",
        "output": """import { useState } from "react";

export function useCounter() {
  const [count, setCount] = useState(0);

  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);

  return { count, increment, decrement };
}"""
    }
]