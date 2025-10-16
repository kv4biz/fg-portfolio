//app/api/admin/blog/[id]/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { ReferenceType } from "@prisma/client";
import { deleteFolderContents } from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("elvora_token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const blog = await prisma.blog.findFirst({
      where: {
        id: id,
        userId: decoded.userId,
      },
      include: { images: true },
    });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, blog });
  } catch (err) {
    console.error("Blog fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch blog" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("elvora_token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const body = await request.json();
    const { tag, readTime, content, featured } = body;

    // Find existing blog
    const existingBlog = await prisma.blog.findFirst({
      where: {
        id: id,
        userId: decoded.userId,
      },
    });

    if (!existingBlog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // If setting as featured, unfeature all other blogs first
    if (featured) {
      await prisma.blog.updateMany({
        where: {
          userId: decoded.userId,
          featured: true,
          id: { not: id }, // Don't unfeature the current blog
        },
        data: {
          featured: false,
        },
      });
    }

    // Title cannot be updated
    const blog = await prisma.blog.update({
      where: { id: id },
      data: {
        tag,
        readTime,
        content,
        featured,
      },
      include: { images: true },
    });

    return NextResponse.json({ success: true, blog });
  } catch (err) {
    console.error("Blog update error:", err);
    return NextResponse.json({ error: "Failed to update blog" }, { status: 500 });
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

    // Find blog with images
    const blog = await prisma.blog.findFirst({
      where: {
        id: id,
        userId: decoded.userId,
      },
      include: { images: true },
    });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Delete associated media records
    const folderPath = `elvora/blog/${blog.title}`;

    try {
      // Delete folder contents from Cloudinary
      await deleteFolderContents(folderPath);
    } catch (error) {
      console.warn("Cloudinary folder deletion warning:", error);
      // Continue with database deletion even if Cloudinary fails
    }

    // Delete all media records associated with this blog
    await prisma.media.deleteMany({
      where: {
        referenceType: ReferenceType.BLOG,
        referenceId: {
          startsWith: `blog-${blog.title.replace(/\s+/g, "-")}-`,
        },
        usage: { userId: decoded.userId },
      },
    });

    // Delete blog from database (this will cascade delete blog images)
    await prisma.blog.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Blog deletion error:", err);
    return NextResponse.json({ error: "Failed to delete blog" }, { status: 500 });
  }
}
