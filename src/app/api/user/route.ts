import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // adjust if your prisma path differs

export async function GET() {
  try {
    // Get the first user (assuming single admin user for the site)
    const user = await prisma.user.findFirst({
      select: {
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
