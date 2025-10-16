// app/api/admin/testimonials/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("elvora_token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      include: {
        testimonials: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    return NextResponse.json({ success: true, testimonials: user?.testimonials || [] });
  } catch (err) {
    console.error("Testimonials fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("elvora_token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const body = await req.json();
    const { name, job, review } = body;

    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    if (!review) return NextResponse.json({ error: "Review is required" }, { status: 400 });

    const userId = decoded.userId;

    const testimonial = await prisma.testimonial.create({
      data: {
        name: name.trim(),
        job: job?.trim() || null,
        review: review.trim(),
        userId,
      },
    });

    return NextResponse.json({ success: true, testimonial });
  } catch (err) {
    console.error("Testimonial creation error:", err);
    return NextResponse.json({ error: "Failed to create testimonial" }, { status: 500 });
  }
}
