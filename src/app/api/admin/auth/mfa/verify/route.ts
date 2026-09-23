// ==============================================================================
// MADHUS BOUTIQUE: ADMIN MFA TOTP VERIFICATION API ROUTE
// Verifies 6-digit TOTP challenge and issues authenticated administrator session
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { adminMfaVerifyInputSchema } from "@/lib/validations/schemas";
import { verifyAdminMfa } from "@/lib/server/auth/adminAuthService";
import { getClientIp } from "@/lib/server/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = adminMfaVerifyInputSchema.parse(body);

    const clientIp = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || undefined;

    const result = await verifyAdminMfa(validated, clientIp, userAgent);

    const response = NextResponse.json({
      success: true,
      message: "MFA verification successful. Session established.",
      data: result,
    });

    // Set secure HttpOnly session cookie
    response.cookies.set("mb_admin_session", result.session_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "MFA verification failed";

    if (message.includes("EXPIRED_CHALLENGE") || message.includes("INVALID_MFA_CODE")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
