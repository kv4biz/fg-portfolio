// app/api/admin/portfolio/image/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { MediaService } from "@/services/media-service";
import { ReferenceType } from "@prisma/client";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("elvora_token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const formData = await request.formData();
    const image = formData.get("image") as File;
    const portfolioId = formData.get("portfolioId") as string;

    if (!image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    if (!portfolioId) {
      return NextResponse.json({ error: "Portfolio ID is required" }, { status: 400 });
    }

    // Verify portfolio exists and belongs to user
    const portfolio = await prisma.portfolio.findFirst({
      where: {
        id: portfolioId,
        userId: decoded.userId,
      },
    });

    if (!portfolio) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
    }

    // For cinematography, only allow one poster image
    if (portfolio.type === "CINEMATOGRAPHY") {
      const existingImages = await prisma.portfolioImage.findMany({
        where: { portfolioId },
      });

      if (existingImages.length > 0) {
        return NextResponse.json({ error: "Cinematography portfolio can only have one poster image" }, { status: 400 });
      }
    }

    // Get existing media count for this portfolio to determine the next number
    const existingMediaCount = await prisma.media.count({
      where: {
        referenceType: ReferenceType.PORTFOLIO,
        referenceId: {
          startsWith: `portfolio-${portfolio.title.replace(/\s+/g, "-")}-`,
        },
        usage: { userId: decoded.userId },
      },
    });

    // Create formatted reference ID: portfolio-{title}-{nextNumber}
    const formattedReferenceId = `portfolio-${portfolio.title.replace(/\s+/g, "-")}-${existingMediaCount + 1}`;

    // Upload image using MediaService
    const uploadResult = await MediaService.uploadWithoutCleanup({
      file: image,
      referenceType: ReferenceType.PORTFOLIO,
      referenceId: formattedReferenceId, // Use formatted reference ID
      folder: `elvora/portfolio/${portfolio.type.toLowerCase()}/${portfolio.title}`,
      userId: decoded.userId,
    });

    if (!uploadResult.success) {
      return NextResponse.json({ error: uploadResult.error }, { status: 400 });
    }

    // Create portfolio image record
    const portfolioImage = await prisma.portfolioImage.create({
      data: {
        url: uploadResult.url,
        portfolioId: portfolioId,
      },
    });

    return NextResponse.json({
      success: true,
      image: portfolioImage,
    });
  } catch (err) {
    console.error("Portfolio image upload error:", err);
    return NextResponse.json({ error: "Failed to upload portfolio image" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("elvora_token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get("imageId");

    if (!imageId) {
      return NextResponse.json({ error: "Image ID is required" }, { status: 400 });
    }

    // Find portfolio image with portfolio relation
    const portfolioImage = await prisma.portfolioImage.findFirst({
      where: { id: imageId },
      include: {
        portfolio: true,
      },
    });

    if (!portfolioImage) {
      return NextResponse.json({ error: "Portfolio image not found" }, { status: 404 });
    }

    // Verify portfolio belongs to user
    if (portfolioImage.portfolio.userId !== decoded.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Find the media record by URL to delete from Cloudinary
    const media = await MediaService.findMediaByUrl(portfolioImage.url, decoded.userId);
    if (media) {
      await MediaService.deleteMediaById(media.id, decoded.userId);
    }

    // Delete portfolio image record
    await prisma.portfolioImage.delete({
      where: { id: imageId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Portfolio image deletion error:", err);
    return NextResponse.json({ error: "Failed to delete portfolio image" }, { status: 500 });
  }
}
