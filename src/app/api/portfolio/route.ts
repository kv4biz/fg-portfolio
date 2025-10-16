// app/api/portfolio/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    // Get all portfolio items with their images
    const portfolioItems = await prisma.portfolio.findMany({
      select: {
        id: true,
        type: true,
        title: true,
        category: true,
        description: true,
        videoUrl: true,
        images: {
          select: {
            id: true,
            url: true,
          },
          orderBy: {
            id: "asc",
          },
        },
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({ portfolioItems });
  } catch (err) {
    console.error("Portfolio data fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch portfolio data" }, { status: 500 });
  }
}
