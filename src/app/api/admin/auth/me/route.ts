// ==============================================================================
// MADHUS BOUTIQUE: ADMIN PROFILE API ROUTE
// Returns active administrator profile, assigned role, and permissions
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { authenticateAdminRequest, ROLE_PERMISSIONS } from "@/lib/server/adminAuth";

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateAdminRequest(req);
    if (!auth.authorized || !auth.role) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const permissions = ROLE_PERMISSIONS[auth.role] || [];

    return NextResponse.json({
      success: true,
      data: {
        id: auth.adminId,
        email: auth.email,
        full_name: auth.fullName,
        role: auth.role,
        permissions,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load admin profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
