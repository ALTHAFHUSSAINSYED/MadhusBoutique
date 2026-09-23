// ==============================================================================
// MADHUS BOUTIQUE: ADMIN API - PAYMENT VERIFICATION ENDPOINT
// Protected by RBAC (SUPER_ADMIN or ORDER_MANAGER), rate-limited & audit-logged
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentInputSchema } from "@/lib/validations/schemas";
import { verifyPaymentByAdmin } from "@/lib/server/db/payments";
import { verifyAdminRole } from "@/lib/server/adminAuth";
import { checkRateLimit, getClientIp } from "@/lib/server/rateLimit";

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce RBAC (SUPER_ADMIN or ORDER_MANAGER required)
    const auth = verifyAdminRole(req, ["SUPER_ADMIN", "ORDER_MANAGER"]);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // 2. Rate limiting for verification actions (30 requests / minute per admin)
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`admin-verify-${auth.adminId}`, {
      maxRequests: 30,
      windowMs: 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too many verification requests. Please slow down.",
          resetMs: rateLimit.resetMs,
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(rateLimit.resetMs / 1000).toString(),
          },
        }
      );
    }

    // 3. Validate payload schema
    const body = await req.json();
    const validated = verifyPaymentInputSchema.parse(body);

    const userAgent = req.headers.get("user-agent") || undefined;

    // 4. Execute atomic payment verification and order status transition
    const result = await verifyPaymentByAdmin(
      auth.adminId,
      validated,
      clientIp,
      userAgent
    );

    return NextResponse.json({
      success: true,
      message:
        validated.action === "VERIFY"
          ? "Payment verified successfully. Order moved to PAYMENT_VERIFIED."
          : "Payment rejected. Order returned to PENDING_PAYMENT.",
      data: result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Payment verification failed";

    // Detect duplicate verification attempts
    if (message.includes("already been verified")) {
      return NextResponse.json({ error: message }, { status: 409 });
    }

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
