// ==============================================================================
// MADHUS BOUTIQUE: DIGITAL DOWNLOAD API ROUTE
// Generates private S3 ZIP archive and issues temporary presigned download URL
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { generateOrderZipArchive } from "@/lib/server/s3/delivery";
import { checkRateLimit, getClientIp } from "@/lib/server/rateLimit";
import { uuidSchema } from "@/lib/validations/schemas";
import { z } from "zod";

const downloadRequestSchema = z.object({
  order_token: uuidSchema,
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await context.params;

    // 1. Sliding-window Rate Limiting: Max 10 download requests per 10 minutes
    const clientIp = getClientIp(req);
    const rateLimitKey = `download-${clientIp}-${orderNumber}`;
    const rateLimit = checkRateLimit(rateLimitKey, {
      maxRequests: 10,
      windowMs: 10 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too many download link requests. Please wait a few minutes before trying again.",
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

    // 2. Validate request body (Requires unguessable UUIDv4 order token)
    const body = await req.json();
    const validated = downloadRequestSchema.parse(body);

    const userAgent = req.headers.get("user-agent") || undefined;

    // 3. Execute secure server-side digital delivery pipeline
    const result = await generateOrderZipArchive(
      orderNumber,
      validated.order_token,
      clientIp,
      userAgent
    );

    return NextResponse.json({
      success: true,
      message: "Presigned digital download URL generated successfully.",
      data: result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Download request failed";

    if (message.includes("UNAUTHORIZED")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    if (message.includes("PAYMENT_REQUIRED") || message.includes("SECURITY_VIOLATION")) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    if (message.includes("EXPIRED")) {
      return NextResponse.json({ error: message }, { status: 410 });
    }
    if (message.includes("QUOTA_EXCEEDED")) {
      return NextResponse.json({ error: message }, { status: 429 });
    }

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
