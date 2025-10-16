// app/api/admin/hero/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
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

    // Get the first user with hero data
    const user = await prisma.user.findFirst({
      include: {
        hero: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      hero: user.hero || {
        id: "",
        title: "",
        subtitle: "",
        description: "",
        bgImageUrl: null,
      },
    });
  } catch (err) {
    console.error("Hero fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch hero data" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
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
    const { title, subtitle, description, bgImageUrl } = await req.json();
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    // Get the first user with hero data
    const user = await prisma.user.findFirst({
      include: {
        hero: true,
      },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    let hero;
    if (user.hero) {
      // Update existing hero
      hero = await prisma.hero.update({
        where: { id: user.hero.id },
        data: {
          title,
          subtitle,
          description,
          bgImageUrl,
        },
      });
    } else {
      // Create new hero
      hero = await prisma.hero.create({
        data: {
          title,
          subtitle,
          description,
          bgImageUrl,
          userId: user.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      hero,
    });
  } catch (err) {
    console.error("Hero update error:", err);
    return NextResponse.json({ error: "Failed to update hero section" }, { status: 500 });
  }
}
