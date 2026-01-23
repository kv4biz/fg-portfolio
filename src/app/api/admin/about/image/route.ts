// app/api/admin/about/image/route.ts
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

    // Get or create about record
    const user = await prisma.user.findFirst({
      include: { about: true },
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let about = user.about;
    if (!about) {
      about = await prisma.about.create({
        data: {
          title: "ABOUT",
          description: "",
          userId: user.id,
        },
      });
    }

    // Upload image using media service with cleanup
    const result = await MediaService.uploadWithCleanup({
      file,
      referenceType: ReferenceType.ABOUT,
      referenceId: "about-profile",
      folder: "elvora/about/profile",
      maxSize: 10 * 1024 * 1024, // 10MB
      userId: decoded.userId,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Update about with new image URL
    const updatedAbout = await prisma.about.update({
      where: { id: about.id },
      data: { aboutImage: result.url },
      include: {
        lists: {
          include: {
            items: true,
          },
        },
        stats: true,
      },
    });

    return NextResponse.json({
      success: true,
      about: updatedAbout,
      message: "About profile image uploaded successfully",
    });
  } catch (error) {
    console.error("About image upload error:", error);
    return NextResponse.json({ error: "Failed to upload about profile image" }, { status: 500 });
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
    const aboutId = searchParams.get("aboutId");

    if (!aboutId) {
      return NextResponse.json({ error: "About ID is required" }, { status: 400 });
    }

    // Get about record
    const about = await prisma.about.findFirst({
      where: {
        id: aboutId,
        userId: decoded.userId,
      },
    });

    if (!about) {
      return NextResponse.json({ error: "About section not found" }, { status: 404 });
    }

    // Delete existing about media using media service
    await MediaService.deleteExistingMedia({
      referenceType: ReferenceType.ABOUT,
      referenceId: aboutId,
      userId: decoded.userId,
    });

    // Update about to remove profile image
    const updatedAbout = await prisma.about.update({
      where: { id: aboutId },
      data: { aboutImage: null },
      include: {
        lists: {
          include: {
            items: true,
          },
        },
        stats: true,
      },
    });

    return NextResponse.json({
      success: true,
      about: updatedAbout,
      message: "About profile image deleted successfully",
    });
  } catch (error) {
    console.error("About image delete error:", error);
    return NextResponse.json({ error: "Failed to delete about profile image" }, { status: 500 });
  }
}
