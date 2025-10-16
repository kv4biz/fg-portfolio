//app/api/admin/blog/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { MediaService } from "@/services/media-service";
import { ReferenceType } from "@prisma/client";

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
        blogs: {
          include: {
            images: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    return NextResponse.json({ success: true, blogs: user?.blogs || [] });
  } catch (err) {
    console.error("Blog fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 });
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
    const { title, tag, readTime, content, featured } = body;

    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
    if (!content) return NextResponse.json({ error: "Content is required" }, { status: 400 });

    const userId = decoded.userId;
    const referenceType = ReferenceType.BLOG;

    // If setting as featured, unfeature all other blogs first
    if (featured) {
      await prisma.blog.updateMany({
        where: {
          userId,
          featured: true,
        },
        data: {
          featured: false,
        },
      });
    }

    // Create the blog
    const blog = await prisma.blog.create({
      data: {
        title,
        tag,
        readTime: readTime || 3,
        content,
        featured: featured || false,
        userId,
      },
      include: { images: true },
    });

    // Move temporary images to permanent
    const moveResult = await MediaService.moveTempImagesToBlog({
      userId,
      referenceType,
      title,
      blogId: blog.id,
    });

    if (!moveResult.success) {
      console.warn("Failed to move temp images:", moveResult.error);
      // Continue even if temp images fail - the blog is already created
    } else {
      // If images were moved successfully, update the blog with the new images
      const updatedBlog = await prisma.blog.findFirst({
        where: { id: blog.id },
        include: { images: true },
      });

      return NextResponse.json({ success: true, blog: updatedBlog });
    }

    return NextResponse.json({ success: true, blog });
  } catch (err) {
    console.error("Blog creation error:", err);
    return NextResponse.json({ error: "Failed to create blog" }, { status: 500 });
  }
}
