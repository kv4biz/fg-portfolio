//src/middleware/auth.middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * authMiddleware
 *
 * - Checks for a server-readable cookie named "elvora_token".
 * - If missing: redirect to /admin/login and preserve attempted path in ?next=
 *
 * IMPORTANT NOTES:
 * - Middleware cannot read localStorage. To enforce server-side protection you must
 *   set an HTTP-only cookie (e.g., "elvora_token") when the admin logs in.
 * - This function deliberately does NOT verify JWT contents (keeps it Edge-safe).
 *   If you want token verification in middleware you'll need a compatible approach
 *   (or move verification into API routes that run in node runtime).
 */

export function authMiddleware(req: NextRequest): NextResponse | null {
  const token = req.cookies.get("elvora_token")?.value;
  if (!token) {
    const loginUrl = new URL("/admin/login", req.url);
    // preserve where user wanted to go
    loginUrl.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // token exists -> allow request to continue.
  // (Optional: add basic expiry check by decoding the token in a server call)
  return null;
}
