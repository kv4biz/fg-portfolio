//app/api/admin/user-settings/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export const runtime = "nodejs";

// GET - Fetch the first user's settings
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

    // Get the first user (since there's only one)
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error("User settings fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch user settings" }, { status: 500 });
  }
}

// PUT - Update the first user's profile
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

    const { firstName, lastName, email } = await req.json();

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Get the first user
    const existingUser = await prisma.user.findFirst();

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update the first user
    const updatedUser = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        firstName,
        lastName,
        email,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatarUrl: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("User settings update error:", err);
    return NextResponse.json({ error: "Failed to update user settings" }, { status: 500 });
  }
}
