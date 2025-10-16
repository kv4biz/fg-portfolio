//src/middleware/restrict.middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * restrictMiddleware
 *
 * Placeholder for additional route rules:
 * - Example: block /admin/setup in production
 * - Example: redirect when maintenance mode is enabled
 *
 * Return a NextResponse to block/redirect, or null to continue.
 */

export function restrictMiddleware(req: NextRequest): NextResponse | null {
  const pathname = req.nextUrl.pathname;

  // Example: prevent running setup route in production
  if (pathname.startsWith("/admin/setup") && process.env.NODE_ENV === "production") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Example: maintenance mode (uncomment to enable)
  // if (process.env.MAINTENANCE_MODE === "1" && !pathname.startsWith('/admin/login')) {
  //   return NextResponse.rewrite(new URL('/maintenance', req.url));
  // }

  return null;
}
