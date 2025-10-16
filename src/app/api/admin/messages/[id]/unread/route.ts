// app/api/admin/messages/[id]/unread/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
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

    const { id } = params;

    const message = await prisma.message.update({
      where: { id },
      data: { read: false },
    });

    return NextResponse.json({ success: true, message });
  } catch (err) {
    console.error("Mark as unread error:", err);
    return NextResponse.json({ error: "Failed to mark message as unread" }, { status: 500 });
  }
}
