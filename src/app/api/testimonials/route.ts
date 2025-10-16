// app/api/testimonials/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    // Fetch all testimonials from the database
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        job: true,
        review: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(testimonials);
  } catch (err) {
    console.error("Testimonials fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }
}
