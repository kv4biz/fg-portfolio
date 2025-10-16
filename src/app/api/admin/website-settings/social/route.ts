// app/api/admin/website-settings/social/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export const runtime = "nodejs";

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

    const { socialLinks } = await req.json();

    if (!Array.isArray(socialLinks)) {
      return NextResponse.json({ error: "Social links must be an array" }, { status: 400 });
    }

    // Get the current user
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete existing social links
    await prisma.socialLink.deleteMany({
      where: { userId: user.id },
    });

    // Create new social links
    const createdLinks = await Promise.all(
      socialLinks.map((link) =>
        prisma.socialLink.create({
          data: {
            name: link.name,
            link: link.link,
            userId: user.id,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      socialLinks: createdLinks,
    });
  } catch (err) {
    console.error("Social links update error:", err);
    return NextResponse.json({ error: "Failed to update social links" }, { status: 500 });
  }
}
