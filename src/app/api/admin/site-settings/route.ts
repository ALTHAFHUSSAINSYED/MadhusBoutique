// ==============================================================================
// MADHUS BOUTIQUE: ADMIN API - SITE SETTINGS & THEME CUSTOMIZER
// Enforces server-side authorization and emits audit logs for all modifications
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { authenticateAdminRequest } from "@/lib/server/adminAuth";
import {
  getActiveSiteSettings,
  updateActiveSiteSettings,
  resetSiteSettingsToDefault,
} from "@/lib/server/db/siteSettings";
import { updateSiteSettingsInputSchema } from "@/lib/validations/siteSettingsSchemas";
import { getClientIp } from "@/lib/server/rateLimit";

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateAdminRequest(req, ["manage:site_settings"]);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const settings = await getActiveSiteSettings();
    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load site settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce RBAC (SUPER_ADMIN or CONTENT_MANAGER required)
    const auth = await authenticateAdminRequest(req, ["manage:site_settings"]);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();

    const clientIp = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || undefined;

    // 2. Handle Reset to Defaults action
    if (body.action === "RESET") {
      const resetResult = await resetSiteSettingsToDefault(
        auth.adminId,
        clientIp,
        userAgent
      );
      return NextResponse.json({
        success: true,
        message: "Site settings and theme reset to factory defaults successfully.",
        data: resetResult,
      });
    }

    // 3. Validate payload schema
    const validated = updateSiteSettingsInputSchema.parse(body);

    // 4. Update database and emit audit log
    const updated = await updateActiveSiteSettings(
      auth.adminId,
      validated,
      clientIp,
      userAgent
    );

    return NextResponse.json({
      success: true,
      message: "Site settings, branding, and theme colors updated successfully.",
      data: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update site settings";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
