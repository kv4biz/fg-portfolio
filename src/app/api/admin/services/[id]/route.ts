// app/api/admin/services/[id]/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id: serviceId } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get("elvora_token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const body = await req.json();
    const { title, description, items } = body;

    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
    if (!description) return NextResponse.json({ error: "Description is required" }, { status: 400 });
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "At least one service item is required" }, { status: 400 });
    }

    // Validate that all items have text
    for (const item of items) {
      if (!item.text || item.text.trim() === "") {
        return NextResponse.json({ error: "All service items must have text" }, { status: 400 });
      }
    }

    const userId = decoded.userId;

    // Verify the service belongs to the user
    const existingService = await prisma.service.findFirst({
      where: {
        id: serviceId,
        userId: userId,
      },
    });

    if (!existingService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Update service and items in a transaction
    const service = await prisma.$transaction(async (tx) => {
      // Update the service
      const updatedService = await tx.service.update({
        where: { id: serviceId },
        data: {
          title: title.trim(),
          description: description.trim(),
        },
      });

      // Delete existing items
      await tx.serviceItem.deleteMany({
        where: { serviceId: serviceId },
      });

      // Create new items
      const serviceItems = await Promise.all(
        items.map((item) =>
          tx.serviceItem.create({
            data: {
              text: item.text.trim(),
              serviceId: serviceId,
            },
          })
        )
      );

      return {
        ...updatedService,
        items: serviceItems,
      };
    });

    return NextResponse.json({ success: true, service });
  } catch (err) {
    console.error("Service update error:", err);
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
  }
}
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("elvora_token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const userId = decoded.userId;
    const serviceId = params.id;

    // Verify the service belongs to the user
    const existingService = await prisma.service.findFirst({
      where: {
        id: serviceId,
        userId: userId,
      },
    });

    if (!existingService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Delete the service (service items will be cascade deleted)
    await prisma.service.delete({
      where: { id: serviceId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Service deletion error:", err);
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
  }
}
