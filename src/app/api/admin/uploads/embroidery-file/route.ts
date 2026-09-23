// ==============================================================================
// MADHUS BOUTIQUE: ADMIN API - EMBROIDERY FILE UPLOAD PRESIGNED URL
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { initiateEmbroideryFileUpload } from "@/lib/server/s3/operations";
import { AdminRole } from "@/../types/database";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const roleHeader = req.headers.get("x-admin-role") as AdminRole | null;
    if (!roleHeader || !["SUPER_ADMIN", "CONTENT_MANAGER"].includes(roleHeader)) {
      return NextResponse.json(
        { error: "Forbidden: Admin authorization required to upload embroidery files." },
        { status: 403 }
      );
    }

    const result = await initiateEmbroideryFileUpload(body, roleHeader);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
