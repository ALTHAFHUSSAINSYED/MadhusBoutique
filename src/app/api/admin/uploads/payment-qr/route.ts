// ==============================================================================
// MADHUS BOUTIQUE: ADMIN API - PAYMENT QR UPLOAD PRESIGNED URL
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { initiatePaymentQrUpload } from "@/lib/server/s3/operations";
import { AdminRole } from "@/../types/database";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const roleHeader = req.headers.get("x-admin-role") as AdminRole | null;
    if (roleHeader !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Super Admin authorization required to update payment QR." },
        { status: 403 }
      );
    }

    const result = await initiatePaymentQrUpload(body, roleHeader);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
