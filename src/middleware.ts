// ==============================================================================
// MADHUS BOUTIQUE: NEXT.JS EDGE ROUTE PROTECTION MIDDLEWARE
// Redirects unauthenticated visitors from /admin/* to /admin/login
// ==============================================================================

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only guard /admin routes
  if (pathname.startsWith("/admin")) {
    // Exclude public admin routes (login, MFA challenge)
    if (pathname === "/admin/login" || pathname === "/admin/mfa") {
      return NextResponse.next();
    }

    // Check for authenticated session cookie
    const sessionCookie = req.cookies.get("mb_admin_session")?.value;

    if (!sessionCookie) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("returnUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
