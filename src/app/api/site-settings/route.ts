// app/api/site-settings/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    // Get the first site settings (assuming one user/site for now)
    // In a multi-user system, you'd want to filter by user or domain
    const siteSettings = await prisma.siteSettings.findFirst({
      select: {
        siteName: true,
        description: true,
        keywords: true,
        footerText: true,
        logoType: true,
        logoText: true,
        logoUrl: true,
        faviconUrl: true,
        ogTitle: true,
        ogDescription: true,
        socialImage: true,
        updatedAt: true,
      },
    });

    if (!siteSettings) {
      // Return default settings if none exist
      return NextResponse.json({
        siteSettings: {
          siteName: "PORTFOLIO",
          description: "Professional Photography & Cinematography",
          footerText: "© {year} PORTFOLIO. All rights reserved.",
          logoType: "text",
          logoText: "PORTFOLIO",
          logoUrl: null,
          faviconUrl: null,
          ogTitle: null,
          ogDescription: null,
          socialImage: null,
        },
      });
    }

    return NextResponse.json({ siteSettings });
  } catch (err) {
    console.error("Site settings fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch site settings" }, { status: 500 });
  }
}
