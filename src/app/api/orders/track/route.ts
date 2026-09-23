// ==============================================================================
// MADHUS BOUTIQUE: ORDER TRACKING API (IDOR VERIFICATION GATEWAY)
// Verifies customer phone or email ownership before releasing order state.
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { trackOrderInputSchema } from "@/lib/validations/schemas";
import { getOrderByNumberAndVerification } from "@/lib/server/db/orders";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    // 1. Validate input schema
    const validated = trackOrderInputSchema.parse(rawBody);

    // 2. Perform server-side IDOR-safe lookup
    const orderData = await getOrderByNumberAndVerification(
      validated.order_number,
      validated.verification
    );

    if (!orderData) {
      return NextResponse.json(
        {
          error:
            "No matching order found for this Order Number and Phone/Email combination.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: orderData.order,
      items: orderData.items,
      verified_token: orderData.order.order_token,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid tracking request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
