// ==============================================================================
// MADHUS BOUTIQUE: ADMIN MANAGEMENT API ROUTE
// Protected exclusively for SUPER_ADMIN role (manage:admins permission)
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { authenticateAdminRequest } from "@/lib/server/adminAuth";
import { listAllAdmins, createAdminAccount } from "@/lib/server/auth/adminAuthService";
import { adminCreateInputSchema } from "@/lib/validations/schemas";
import { getClientIp } from "@/lib/server/rateLimit";

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateAdminRequest(req, ["manage:admins"]);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const admins = await listAllAdmins();
    return NextResponse.json({
      success: true,
      data: admins,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load admins";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateAdminRequest(req, ["manage:admins"]);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const validated = adminCreateInputSchema.parse(body);

    const clientIp = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || undefined;

    const newAdmin = await createAdminAccount(
      validated,
      auth.adminId,
      clientIp,
      userAgent
    );

    return NextResponse.json({
      success: true,
      message: `Administrator ${newAdmin.full_name} (${newAdmin.role}) created successfully.`,
      data: newAdmin,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create administrator";

    if (message.includes("DUPLICATE_EMAIL")) {
      return NextResponse.json({ error: message }, { status: 409 });
    }

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
