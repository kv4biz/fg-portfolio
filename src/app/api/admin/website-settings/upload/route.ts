// app/api/admin/website-settings/upload/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
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
    const file = formData.get("file") as File | null;
    const imageType = formData.get("imageType") as "logo" | "favicon" | "socialImage" | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!imageType) {
      return NextResponse.json({ error: "Image type is required" }, { status: 400 });
    }

    // Get the current user
    const user = await prisma.user.findFirst({
      include: {
        siteSettings: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.siteSettings) {
      return NextResponse.json({ error: "Site settings not found" }, { status: 404 });
    }

    // Map imageType to siteSettings field and reference ID
    const fieldMapping = {
      logo: { field: "logoUrl" as const, referenceId: "website-settings-logo" },
      favicon: { field: "faviconUrl" as const, referenceId: "website-settings-favicon" },
      socialImage: { field: "socialImage" as const, referenceId: "website-settings-social" },
    };

    const { field: currentImageField, referenceId } = fieldMapping[imageType];

    // Use MediaService to upload with automatic cleanup of existing media
    const uploadResult = await MediaService.uploadWithCleanup({
      file,
      referenceType: ReferenceType.OTHER,
      referenceId,
      folder: `elvora/website-settings/${imageType}`,
      maxSize: 10 * 1024 * 1024, // 10MB
      userId: user.id,
    });

    if (!uploadResult.success) {
      return NextResponse.json({ error: uploadResult.error }, { status: 400 });
    }

    // Update siteSettings with the new image URL
    const updateData = {
      [currentImageField]: uploadResult.url,
    };

    await prisma.siteSettings.update({
      where: { id: user.siteSettings.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      message: `${imageType.charAt(0).toUpperCase() + imageType.slice(1)} uploaded successfully`,
    });
  } catch (err) {
    console.error("Website settings upload error:", err);
    return NextResponse.json(
      {
        error: "Failed to upload image",
      },
      { status: 500 }
    );
  }
}
