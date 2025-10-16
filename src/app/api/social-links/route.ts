// app/api/social-links/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    // Get all social links
    const socialLinks = await prisma.socialLink.findMany({
      select: {
        id: true,
        name: true,
        link: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    return NextResponse.json({ socialLinks });
  } catch (err) {
    console.error("Social links fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch social links" }, { status: 500 });
  }
}
