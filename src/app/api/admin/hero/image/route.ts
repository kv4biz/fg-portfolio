// app/api/admin/hero/image/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { MediaService } from "@/services/media-service";
import { ReferenceType } from "@prisma/client";

export const runtime = "nodejs";
// POST method
export async function POST(req: Request) {
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

    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Get or create hero record
    const user = await prisma.user.findFirst({
      include: { hero: true },
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let hero = user.hero;
    if (!hero) {
      hero = await prisma.hero.create({
        data: {
          title: "Your Title",
          subtitle: "",
          description: "",
          userId: user.id,
        },
      });
    }

    // Upload image using media service with cleanup
    const result = await MediaService.uploadWithCleanup({
      file,
      referenceType: ReferenceType.HERO,
      referenceId: "hero-background",
      folder: "elvora/hero/background",
      maxSize: 10 * 1024 * 1024, // 10MB
      userId: decoded.userId,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Update hero with new image URL
    const updatedHero = await prisma.hero.update({
      where: { id: hero.id },
      data: { bgImageUrl: result.url },
    });

    return NextResponse.json({
      success: true,
      hero: updatedHero,
      message: "Hero background image uploaded successfully",
    });
  } catch (error) {
    console.error("Hero image upload error:", error);
    return NextResponse.json({ error: "Failed to upload hero background image" }, { status: 500 });
  }
}
// DELETE method
export async function DELETE(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const heroId = searchParams.get("heroId");

    if (!heroId) {
      return NextResponse.json({ error: "Hero ID is required" }, { status: 400 });
    }

    // Get hero record
    const hero = await prisma.hero.findFirst({
      where: {
        id: heroId,
        userId: decoded.userId,
      },
    });

    if (!hero) {
      return NextResponse.json({ error: "Hero section not found" }, { status: 404 });
    }

    // Delete existing hero media using media service
    await MediaService.deleteExistingMedia({
      referenceType: ReferenceType.HERO,
      referenceId: heroId,
      userId: decoded.userId,
    });

    // Update hero to remove background image
    const updatedHero = await prisma.hero.update({
      where: { id: heroId },
      data: { bgImageUrl: null },
    });

    return NextResponse.json({
      success: true,
      hero: updatedHero,
      message: "Hero background image deleted successfully",
    });
  } catch (error) {
    console.error("Hero image delete error:", error);
    return NextResponse.json({ error: "Failed to delete hero background image" }, { status: 500 });
  }
}
