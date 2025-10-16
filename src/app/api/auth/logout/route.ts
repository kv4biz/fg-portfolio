/**
 * app/api/auth/logout/route.ts
 *
 * Clears the JWT cookie (`elvora_token`) to log the admin out.
 */

import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  try {
    // Create an expired cookie to remove token
    const cookie = `elvora_token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax; ${process.env.NODE_ENV === "production" ? "Secure;" : ""}`;

    return new NextResponse(JSON.stringify({ success: true, message: "Logged out successfully" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": cookie,
      },
    });
  } catch (err) {
    console.error("Logout error:", err);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
