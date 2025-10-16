// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authMiddleware } from "@/middleware/auth.middleware";
import { restrictMiddleware } from "@/middleware/restrict.middleware";

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Allow /admin route - your AdminPage handles auth state
  if (pathname === "/admin") {
    return NextResponse.next();
  }

  // Protect all other admin routes
  if (pathname.startsWith("/admin")) {
    // 1) auth check
    const authResponse = authMiddleware(req);
    if (authResponse) return authResponse;

    // 2) additional restrictions
    const restrictResponse = restrictMiddleware(req);
    if (restrictResponse) return restrictResponse;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
