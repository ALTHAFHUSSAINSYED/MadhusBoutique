// ==============================================================================
// MADHUS BOUTIQUE: ORDERS API (GUEST CHECKOUT & ORDER CREATION)
// Server-side price recalculation & immutable snapshotting.
// Never trusts client-submitted prices or totals.
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createOrderInputSchema } from "@/lib/validations/schemas";
import { createGuestOrder } from "@/lib/server/db/orders";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    // 1. Validate request payload with Zod (strictly strips/rejects arbitrary price fields)
    const validatedInput = createOrderInputSchema.parse(rawBody);

    // 2. Delegate to server-side order processor
    // Server computes: product price, quantity, line subtotals, and grand total from DB
    const orderResult = await createGuestOrder(validatedInput);

    return NextResponse.json(
      {
        success: true,
        order: {
          order_id: orderResult.order_id,
          order_number: orderResult.order_number,
          order_token: orderResult.order_token,
          total_amount: orderResult.total_amount,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create order";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
