import { getServerSession } from "next-auth";
import { authOptions } from "@/_lib/auth/config";
import { prisma } from "@/_lib/prisma/index";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sessions = await prisma.chatSession.findMany({
    where: { userId: session.user.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(sessions);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { agent } = await req.json();
  if (!agent) return NextResponse.json({ error: "agent is required" }, { status: 400 });

  const chatSession = await prisma.chatSession.create({
    data: { userId: session.user.id, agent },
  });
  return NextResponse.json(chatSession, { status: 201 });
}
