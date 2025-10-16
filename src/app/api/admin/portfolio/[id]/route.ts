// app/api/admin/portfolio/[id]/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { MediaService } from "@/services/media-service";
import { PortfolioType, ReferenceType } from "@prisma/client";
import { deleteFolderContents } from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // Await params here
    const cookieStore = await cookies();
    const token = cookieStore.get("elvora_token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const portfolio = await prisma.portfolio.findFirst({
      where: {
        id: id, // Use the awaited id
        userId: decoded.userId,
      },
      include: { images: true },
    });

    if (!portfolio) {
      return NextResponse.json({ error: "Portfolio item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, portfolio });
  } catch (err) {
    console.error("Portfolio fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch portfolio item" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // Await params here
    const cookieStore = await cookies();
    const token = cookieStore.get("elvora_token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const body = await request.json();
    const { category, description, videoUrl, posterUrl } = body;

    // Find existing portfolio
    const existingPortfolio = await prisma.portfolio.findFirst({
      where: {
        id: id, // Use the awaited id
        userId: decoded.userId,
      },
    });

    if (!existingPortfolio) {
      return NextResponse.json({ error: "Portfolio item not found" }, { status: 404 });
    }

    // Title cannot be updated
    const portfolio = await prisma.portfolio.update({
      where: { id: id }, // Use the awaited id
      data: {
        category,
        description,
        videoUrl,
        posterUrl,
      },
      include: { images: true },
    });

    return NextResponse.json({ success: true, portfolio });
  } catch (err) {
    console.error("Portfolio update error:", err);
    return NextResponse.json({ error: "Failed to update portfolio item" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("elvora_token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    // Find portfolio with images
    const portfolio = await prisma.portfolio.findFirst({
      where: {
        id: id,
        userId: decoded.userId,
      },
      include: { images: true },
    });

    if (!portfolio) {
      return NextResponse.json({ error: "Portfolio item not found" }, { status: 404 });
    }

    // Delete associated media records first
    if (portfolio.type === PortfolioType.PHOTOGRAPHY) {
      const folderPath = `elvora/portfolio/${portfolio.type.toLowerCase()}/${portfolio.title}`;

      try {
        // Delete folder contents from Cloudinary
        await deleteFolderContents(folderPath);
      } catch (error) {
        console.warn("Cloudinary folder deletion warning:", error);
        // Continue with database deletion even if Cloudinary fails
      }

      // Delete all media records associated with this portfolio using formatted reference IDs
      await prisma.media.deleteMany({
        where: {
          referenceType: ReferenceType.PORTFOLIO,
          referenceId: {
            startsWith: `portfolio-${portfolio.title.replace(/\s+/g, "-")}-`,
          },
          usage: { userId: decoded.userId },
        },
      });
    } else {
      // For cinematography, delete individual poster images
      if (portfolio.images.length > 0) {
        for (const image of portfolio.images) {
          const media = await MediaService.findMediaByUrl(image.url, decoded.userId);
          if (media) {
            await MediaService.deleteMediaById(media.id, decoded.userId);
          }
        }
      }
    }

    // Delete portfolio from database (this will cascade delete portfolio images)
    await prisma.portfolio.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Portfolio deletion error:", err);
    return NextResponse.json({ error: "Failed to delete portfolio item" }, { status: 500 });
  }
}
