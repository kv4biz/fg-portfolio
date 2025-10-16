// app/api/admin/messages/[id]/read/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("elvora_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const message = await prisma.message.update({
      where: { id },
      data: { read: true },
    });

    return NextResponse.json({ success: true, message });
  } catch (err) {
    console.error("Mark as read error:", err);
    return NextResponse.json({ error: "Failed to mark message as read" }, { status: 500 });
  }
}
