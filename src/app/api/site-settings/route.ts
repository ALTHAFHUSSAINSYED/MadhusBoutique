// ==============================================================================
// MADHUS BOUTIQUE: PUBLIC SITE SETTINGS & THEME API ROUTE
// Returns current contacts, brand assets, dynamic theme colors, and page texts
// ==============================================================================

import { NextResponse } from "next/server";
import { getActiveSiteSettings } from "@/lib/server/db/siteSettings";

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
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
