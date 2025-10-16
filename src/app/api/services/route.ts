// app/api/services/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    // Get all services with their items
    const services = await prisma.service.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        items: {
          select: {
            id: true,
            text: true,
          },
          orderBy: {
            id: "asc",
          },
        },
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({ services });
  } catch (err) {
    console.error("Services data fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch services data" }, { status: 500 });
  }
}
