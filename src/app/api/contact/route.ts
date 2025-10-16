// app/api/contact/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    // Get the first contact info (assuming one user/contact for now)
    const contactInfo = await prisma.contactInfo.findFirst({
      select: {
        email: true,
        phone: true,
        whatsapp: true,
        location: true,
        workDays: true,
        workHours: true,
      },
    });

    if (!contactInfo) {
      // Return default contact info if none exist
      return NextResponse.json({
        contactInfo: {
          email: "contact@example.com",
          phone: null,
          whatsapp: null,
          location: null,
          workDays: null,
          workHours: null,
        },
      });
    }

    return NextResponse.json({ contactInfo });
  } catch (err) {
    console.error("Contact info fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch contact info" }, { status: 500 });
  }
}
