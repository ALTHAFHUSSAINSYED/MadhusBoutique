// ==============================================================================
// MADHUS BOUTIQUE: ADMIN LOGIN API ROUTE
// Authenticates credentials, checks lockout, and handles MFA or session issuance
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { adminLoginInputSchema } from "@/lib/validations/schemas";
import { loginAdmin } from "@/lib/server/auth/adminAuthService";
import { getClientIp } from "@/lib/server/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = adminLoginInputSchema.parse(body);

    const clientIp = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || undefined;

    const result = await loginAdmin(validated, clientIp, userAgent);

    const response = NextResponse.json({
      success: true,
      data: result,
    });

    // If session token issued directly (non-MFA), attach HttpOnly session cookie
    if (result.session_token) {
      response.cookies.set("mb_admin_session", result.session_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 24 * 60 * 60, // 24 hours
      });
    }

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Authentication failed";

    if (message.includes("ACCOUNT_LOCKED")) {
      return NextResponse.json({ error: message }, { status: 429 });
    }
    if (message.includes("INVALID_CREDENTIALS")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
