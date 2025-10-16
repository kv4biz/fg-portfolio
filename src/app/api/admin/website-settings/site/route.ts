// app/api/admin/website-settings/site/route.ts
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

    const { siteName, description, keywords, footerText, logoType, logoText, logoUrl, faviconUrl, ogTitle, ogDescription, socialImage } =
      await req.json();

    if (!siteName) {
      return NextResponse.json({ error: "Site name is required" }, { status: 400 });
    }

    // Get the first user with siteSettings (assuming data is already seeded)
    const user = await prisma.user.findFirst({
      include: {
        siteSettings: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.siteSettings) {
      return NextResponse.json({ error: "Site settings not found. Please ensure data is seeded." }, { status: 404 });
    }

    // Update existing site settings (don't create new ones)
    const siteSettings = await prisma.siteSettings.update({
      where: { id: user.siteSettings.id },
      data: {
        siteName,
        description,
        keywords,
        footerText,
        logoType,
        logoText,
        logoUrl,
        faviconUrl,
        ogTitle,
        ogDescription,
        socialImage,
      },
    });

    return NextResponse.json({ success: true, siteSettings });
  } catch (err) {
    console.error("Site settings update error:", err);
    return NextResponse.json({ error: "Failed to update site settings" }, { status: 500 });
  }
}
