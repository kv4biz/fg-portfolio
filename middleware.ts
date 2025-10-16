import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authMiddleware } from "@/middleware/auth.middleware";
import { restrictMiddleware } from "@/middleware/restrict.middleware";

/**
 * Root middleware entry.
 * - Only file Next.js recognizes automatically.
 * - Composes smaller middleware helpers located under lib/middleware/.
 *
 * Behaviour:
 * - For any path starting with /admin, run authMiddleware and restrictMiddleware.
 * - If a middleware returns a NextResponse, we return it (redirect/block).
 * - Otherwise continue with NextResponse.next().
 */

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith("/admin")) {
    // 1) auth check (cookie presence)
    const authResponse = authMiddleware(req);
    if (authResponse) return authResponse;

    // 2) additional route-level restrictions
    const restrictResponse = restrictMiddleware(req);
    if (restrictResponse) return restrictResponse;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
