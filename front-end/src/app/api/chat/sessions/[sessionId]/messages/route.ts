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
  const message = await prisma.chatMessage.create({
    data: { sessionId: params.sessionId, role, content },
  });
  return NextResponse.json(message, { status: 201 });
}
