// app/api/admin/website-settings/route.ts
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

    // Get the first user and their related data (assuming data is already seeded)
    const user = await prisma.user.findFirst({
      include: {
        siteSettings: true,
        contactInfo: true,
        socialLinks: {
          orderBy: {
            name: "asc",
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.siteSettings) {
      return NextResponse.json({ error: "Site settings not found. Please ensure data is seeded." }, { status: 404 });
    }

    if (!user.contactInfo) {
      return NextResponse.json({ error: "Contact info not found. Please ensure data is seeded." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      siteSettings: user.siteSettings,
      contactInfo: user.contactInfo,
      socialLinks: user.socialLinks,
    });
  } catch (err) {
    console.error("Website settings fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch website settings" }, { status: 500 });
  }
}
