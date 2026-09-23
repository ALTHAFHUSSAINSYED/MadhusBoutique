// ==============================================================================
// MADHUS BOUTIQUE: ORDER DETAILS API (TOKEN-PROTECTED IDOR DEFENSE)
// Strictly prevents users from accessing arbitrary orders by altering URL IDs.
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getOrderByToken } from "@/lib/server/db/orders";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await context.params;
    const token = req.nextUrl.searchParams.get("token");

    if (!orderNumber) {
      return NextResponse.json({ error: "Order number is required." }, { status: 400 });
    }

    // IDOR Protection: Requests without an unguessable order token are denied
    if (!token) {
      return NextResponse.json(
        {
          error: "UNAUTHORIZED_ORDER_ACCESS: A valid order token is required to inspect this order.",
          requiresVerification: true,
        },
        { status: 401 }
      );
    }

    const orderData = await getOrderByToken(orderNumber, token);

    if (!orderData) {
      return NextResponse.json(
        {
          error: "FORBIDDEN_ORDER_ACCESS: Order not found or the provided token does not match.",
          requiresVerification: true,
        },
        { status: 403 }
      );
    }

    // Mask sensitive contact details for additional privacy
    const maskedPhone = orderData.customer.phone.replace(/(\d{3})\d{4}(\d{3})/, "$1****$2");
    const maskedEmail = orderData.customer.email.replace(/(.{2})(.*)(@.*)/, "$1***$3");

    return NextResponse.json({
      success: true,
      order: orderData.order,
      items: orderData.items,
      customer: {
        name: orderData.customer.name,
        phone: maskedPhone,
        email: maskedEmail,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
