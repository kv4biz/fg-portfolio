// app/api/admin/portfolio/temp/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
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
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadResult = await MediaService.uploadTemporaryMedia({
      files,
      referenceType: ReferenceType.PORTFOLIO,
      userId: decoded.userId,
    });

    if (!uploadResult.success) {
      return NextResponse.json({ error: uploadResult.error }, { status: 400 });
    }

    // Convert BigInt values to strings for JSON serialization
    const serializedMedia = (uploadResult.uploadedMedia ?? []).map((media) => ({
      ...media,
      bytes: media.bytes.toString(), // Convert BigInt to string
      createdAt: media.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      uploadedMedia: serializedMedia,
    });
  } catch (err) {
    console.error("Temporary upload error:", err);
    return NextResponse.json({ error: "Failed to upload temporary images" }, { status: 500 });
  }
}

// DELETE endpoint to clean up temporary media when user cancels
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("elvora_token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    // Clean up all temporary portfolio media for this user (immediate = true)
    const result = await MediaService.cleanupOrphanedTempImages(decoded.userId, ReferenceType.PORTFOLIO, true);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      message: "Temporary portfolio images cleaned up successfully",
    });
  } catch (err) {
    console.error("Temporary cleanup error:", err);
    return NextResponse.json({ error: "Failed to cleanup temporary images" }, { status: 500 });
  }
}
