// app/api/blog/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    // Get all blog posts with their images
    const blogs = await prisma.blog.findMany({
      select: {
        id: true,
        title: true,
        date: true,
        readTime: true,
        tag: true,
        featured: true,
        content: true,
        images: {
          select: {
            id: true,
            url: true,
          },
          orderBy: {
            id: "asc",
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json({ blogs });
  } catch (err) {
    console.error("Blog data fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch blog data" }, { status: 500 });
  }
}
