// ==============================================================================
// MADHUS BOUTIQUE: ADMIN LOGOUT API ROUTE
// Revokes administrative session and clears session cookie
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { logoutAdmin } from "@/lib/server/auth/adminAuthService";
import { getClientIp } from "@/lib/server/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get("mb_admin_session")?.value;
    const authHeader = req.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7).trim() : null;
    const sessionToken = cookieToken || bearerToken;

    const clientIp = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || undefined;

    if (sessionToken) {
      await logoutAdmin(sessionToken, clientIp, userAgent);
    }

    const response = NextResponse.json({
      success: true,
      message: "Administrator session terminated successfully.",
    });

    // Clear session cookie
    response.cookies.set("mb_admin_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Logout error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
