// app/api/admin/services/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

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
        services: {
          include: {
            items: {
              orderBy: {
                id: "asc",
              },
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
        },
      },
    });

    return NextResponse.json({ success: true, services: user?.services || [] });
  } catch (err) {
    console.error("Services fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
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

    // Create the service with items in a transaction
    const service = await prisma.$transaction(async (tx) => {
      const createdService = await tx.service.create({
        data: {
          title: title.trim(),
          description: description.trim(),
          userId,
        },
      });

      // Create service items
      const serviceItems = await Promise.all(
        items.map((item) =>
          tx.serviceItem.create({
            data: {
              text: item.text.trim(),
              serviceId: createdService.id,
            },
          })
        )
      );

      return {
        ...createdService,
        items: serviceItems,
      };
    });

    return NextResponse.json({ success: true, service });
  } catch (err) {
    console.error("Service creation error:", err);
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}
