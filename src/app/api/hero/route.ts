// app/api/hero/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    // Get the first hero data (assuming one user/hero for now)
    const hero = await prisma.hero.findFirst({
      select: {
        title: true,
        subtitle: true,
        description: true,
        bgImageUrl: true,
        updatedAt: true,
      },
    });

    if (!hero) {
      // Return default hero data if none exist
      return NextResponse.json({
        hero: {
          title: "ELENA\nMORRISON",
          subtitle: "Photography & Modeling",
          description: "Capturing elegance through the lens of luxury fashion and portrait photography",
          bgImageUrl:
            "https://images.unsplash.com/photo-1636342230725-e1960028b85e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMG1hbiUyMGZhc2hpb24lMjBtb2RlbCUyMHBvcnRyYWl0JTIwbHV4dXJ5fGVufDF8fHx8MTc1OTg1OTIzMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        },
      });
    }

    return NextResponse.json({ hero });
  } catch (err) {
    console.error("Hero data fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch hero data" }, { status: 500 });
  }
}
