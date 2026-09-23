// ==============================================================================
// MADHUS BOUTIQUE: PAYMENT REFERENCE SUBMISSION API
// Verifies order token ownership, applies rate limits, and records 12-digit UTR
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { submitPaymentInputSchema } from "@/lib/validations/schemas";
import { submitPaymentReference } from "@/lib/server/db/payments";
import { checkRateLimit, getClientIp } from "@/lib/server/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    // 1. Validate payload structure
    const validated = submitPaymentInputSchema.parse(rawBody);

    // 2. Enforce Rate Limiting (Max 5 submissions per 10 minutes per IP/Order)
    const clientIp = getClientIp(req);
    const rateLimitKey = `payment-submit-${clientIp}-${validated.order_number}`;
    const rateLimit = checkRateLimit(rateLimitKey, {
      maxRequests: 5,
      windowMs: 10 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too many payment submission attempts. Please wait before trying again.",
          resetMs: rateLimit.resetMs,
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(rateLimit.resetMs / 1000).toString(),
            "X-RateLimit-Limit": rateLimit.limit.toString(),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    // 3. Delegate to server payment service (enforces order token ownership, duplicate UTR check, and server price binding)
    const result = await submitPaymentReference(validated);

    return NextResponse.json(
      {
        success: true,
        message: "Payment reference submitted successfully. Pending administrative verification.",
        data: result,
      },
      {
        headers: {
          "X-RateLimit-Limit": rateLimit.limit.toString(),
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
        },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Payment submission failed";

    if (message.includes("already been submitted")) {
      return NextResponse.json({ error: message }, { status: 409 });
    }

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
