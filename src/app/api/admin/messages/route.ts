// app/api/admin/messages/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("elvora_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get messages for the current user
    const user = await prisma.user.findFirst({
      include: {
        messages: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const messages = user.messages.map((message) => ({
      id: message.id,
      name: message.name,
      email: message.email,
      subject: message.subject,
      message: message.message,
      read: message.read,
      createdAt: message.createdAt.toISOString(),
    }));

    return NextResponse.json({ messages });
  } catch (err) {
    console.error("Messages fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}
