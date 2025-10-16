// app/api/admin/website-settings/contact/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function PUT(req: Request) {
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

    const { email, phone, whatsapp, location, workDays, workHours } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Get the first user with contactInfo (assuming data is already seeded)
    const user = await prisma.user.findFirst({
      include: {
        contactInfo: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.contactInfo) {
      return NextResponse.json({ error: "Contact info not found. Please ensure data is seeded." }, { status: 404 });
    }

    // Update existing contact info (don't create new ones)
    const contactInfo = await prisma.contactInfo.update({
      where: { id: user.contactInfo.id },
      data: {
        email,
        phone,
        whatsapp,
        location,
        workDays,
        workHours,
      },
    });

    return NextResponse.json({ success: true, contactInfo });
  } catch (err) {
    console.error("Contact info update error:", err);
    return NextResponse.json({ error: "Failed to update contact information" }, { status: 500 });
  }
}
