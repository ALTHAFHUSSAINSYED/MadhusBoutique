// ==============================================================================
// MADHUS BOUTIQUE: ADMIN API - PAYMENT SETTINGS & ACTIVE QR MODIFICATION
// Requires SUPER_ADMIN role and elevated MFA / step-up authentication
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { updatePaymentSettingsInputSchema } from "@/lib/validations/schemas";
import { updateActivePaymentSettings } from "@/lib/server/db/paymentSettings";
import { verifyAdminRole, verifyElevatedAdminAuth } from "@/lib/server/adminAuth";
import { getClientIp } from "@/lib/server/rateLimit";

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce SUPER_ADMIN role authorization
    const auth = verifyAdminRole(req, ["SUPER_ADMIN"]);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // 2. Enforce Elevated Authentication (MFA / Step-up token)
    const elevated = verifyElevatedAdminAuth(req);
    if (!elevated.authorized) {
      return NextResponse.json({ error: elevated.error }, { status: elevated.status });
    }

    // 3. Validate request payload
    const body = await req.json();
    const validated = updatePaymentSettingsInputSchema.parse(body);

    const clientIp = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || undefined;

    // 4. Update database settings and emit immutable audit log
    const updated = await updateActivePaymentSettings(
      auth.adminId,
      validated,
      clientIp,
      userAgent
    );

    return NextResponse.json({
      success: true,
      message: "Payment settings and QR configuration updated successfully.",
      data: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update payment settings";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
