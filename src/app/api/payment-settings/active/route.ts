// ==============================================================================
// MADHUS BOUTIQUE: ACTIVE PAYMENT SETTINGS API
// Returns active UPI ID, merchant name, and presigned temporary S3 QR image URL
// ==============================================================================

import { NextResponse } from "next/server";
import { getActivePaymentSettings } from "@/lib/server/db/paymentSettings";

export async function GET() {
  try {
    const settings = await getActivePaymentSettings();

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load payment settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
