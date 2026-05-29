import { getServerSession } from "next-auth";
import { authOptions } from "@/_lib/auth/config";
import { prisma } from "@/_lib/prisma/index";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { sessionId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const owned = await prisma.chatSession.findFirst({
    where: { id: params.sessionId, userId: session.user.id },
  });
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { role, content } = await req.json();
  if (!["user", "assistant"].includes(role) || !content?.trim()) {
    return NextResponse.json({ error: "Invalid role or content" }, { status: 400 });
  }
  const message = await prisma.chatMessage.create({
    data: { sessionId: params.sessionId, role, content },
  });
  return NextResponse.json(message, { status: 201 });
}
