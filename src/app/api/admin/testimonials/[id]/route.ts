// app/api/admin/testimonials/[id]/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: testimonialId } = await params;

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

    // Verify the testimonial belongs to the user
    const existingTestimonial = await prisma.testimonial.findFirst({
      where: {
        id: testimonialId,
        userId: userId,
      },
    });

    if (!existingTestimonial) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }

    const testimonial = await prisma.testimonial.update({
      where: { id: testimonialId },
      data: {
        name: name.trim(),
        job: job?.trim() || null,
        review: review.trim(),
      },
    });

    return NextResponse.json({ success: true, testimonial });
  } catch (err) {
    console.error("Testimonial update error:", err);
    return NextResponse.json({ error: "Failed to update testimonial" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: testimonialId } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get("elvora_token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const userId = decoded.userId;

    // Verify the testimonial belongs to the user
    const existingTestimonial = await prisma.testimonial.findFirst({
      where: {
        id: testimonialId,
        userId: userId,
      },
    });

    if (!existingTestimonial) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }

    // Delete the testimonial
    await prisma.testimonial.delete({
      where: { id: testimonialId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Testimonial deletion error:", err);
    return NextResponse.json({ error: "Failed to delete testimonial" }, { status: 500 });
  }
}
