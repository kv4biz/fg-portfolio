//app/api/admin/blog/image/route.ts
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
    const blogId = formData.get("blogId") as string;

    if (!image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    if (!blogId) {
      return NextResponse.json({ error: "Blog ID is required" }, { status: 400 });
    }

    // Verify blog exists and belongs to user
    const blog = await prisma.blog.findFirst({
      where: {
        id: blogId,
        userId: decoded.userId,
      },
    });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Get existing media count for this blog to determine the next number
    const existingMediaCount = await prisma.media.count({
      where: {
        referenceType: ReferenceType.BLOG,
        referenceId: {
          startsWith: `blog-${blog.title.replace(/\s+/g, "-")}-`,
        },
        usage: { userId: decoded.userId },
      },
    });

    // Create formatted reference ID: blog-{title}-{nextNumber}
    const formattedReferenceId = `blog-${blog.title.replace(/\s+/g, "-")}-${existingMediaCount + 1}`;

    // Upload image using MediaService
    const uploadResult = await MediaService.uploadWithoutCleanup({
      file: image,
      referenceType: ReferenceType.BLOG,
      referenceId: formattedReferenceId,
      folder: `elvora/blog/${blog.title}`,
      userId: decoded.userId,
    });

    if (!uploadResult.success) {
      return NextResponse.json({ error: uploadResult.error }, { status: 400 });
    }

    // Create blog image record
    const blogImage = await prisma.blogImage.create({
      data: {
        url: uploadResult.url,
        blogId: blogId,
      },
    });

    return NextResponse.json({
      success: true,
      image: blogImage,
    });
  } catch (err) {
    console.error("Blog image upload error:", err);
    return NextResponse.json({ error: "Failed to upload blog image" }, { status: 500 });
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

    // Find blog image with blog relation
    const blogImage = await prisma.blogImage.findFirst({
      where: { id: imageId },
      include: {
        blog: true,
      },
    });

    if (!blogImage) {
      return NextResponse.json({ error: "Blog image not found" }, { status: 404 });
    }

    // Verify blog belongs to user
    if (blogImage.blog.userId !== decoded.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Find the media record by URL to delete from Cloudinary
    const media = await MediaService.findMediaByUrl(blogImage.url, decoded.userId);
    if (media) {
      await MediaService.deleteMediaById(media.id, decoded.userId);
    }

    // Delete blog image record
    await prisma.blogImage.delete({
      where: { id: imageId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Blog image deletion error:", err);
    return NextResponse.json({ error: "Failed to delete blog image" }, { status: 500 });
  }
}
