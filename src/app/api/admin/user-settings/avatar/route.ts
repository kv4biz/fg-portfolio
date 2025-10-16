// app/api/admin/user-settings/avatar/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { MediaService } from "@/services/media-service";
import { ReferenceType } from "@prisma/client";

export const runtime = "nodejs";

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
    const file = formData.get("avatar") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Use MediaService for upload with cleanup
    const result = await MediaService.uploadWithCleanup({
      file,
      referenceType: ReferenceType.OTHER,
      referenceId: "user-settings-avatar",
      folder: "elvora/user-settings/avatar",
      userId: decoded.userId,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Update user with new avatar URL
    const { prisma } = await import("@/lib/prisma");
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        avatarUrl: result.url,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatarUrl: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: "Avatar uploaded successfully",
    });
  } catch (err) {
    console.error("Avatar upload error:", err);
    return NextResponse.json(
      {
        error: "Failed to upload avatar",
      },
      { status: 500 }
    );
  }
}
