// app/api/admin/overview/route.ts (updated)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        email: true,
        createdAt: true,
      },
    });

    const [portfolioCount, serviceCount, blogCount, testimonialCount, messageCount, mediaUsage] = await Promise.all([
      prisma.portfolio.count(),
      prisma.service.count(),
      prisma.blog.count(),
      prisma.testimonial.count(),
      prisma.message.count(),
      prisma.mediaUsage.findFirst({
        include: {
          media: true, // Include media records to calculate counts
        },
      }),
    ]);

    // Calculate storage stats from media records
    let usedBytes = 0;
    let imageCount = 0;
    let videoCount = 0;

    if (mediaUsage) {
      usedBytes = Number(mediaUsage.media.reduce((sum, media) => sum + media.bytes, BigInt(0)));
      imageCount = mediaUsage.media.filter((media) => media.mediaType === "IMAGE").length;
      videoCount = mediaUsage.media.filter((media) => media.mediaType === "VIDEO").length;
    }

    return NextResponse.json({
      success: true,
      user,
      stats: {
        portfolios: portfolioCount,
        services: serviceCount,
        blogs: blogCount,
        testimonials: testimonialCount,
        messages: messageCount,
      },
      storage: {
        used: usedBytes,
        limit: Number(mediaUsage?.allocatedBytes || 2147483648),
        imageCount: imageCount,
        videoCount: videoCount,
      },
    });
  } catch (err) {
    console.error("Dashboard overview error:", err);
    return NextResponse.json({ error: "Failed to load overview" }, { status: 500 });
  }
}
