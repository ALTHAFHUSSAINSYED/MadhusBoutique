// ==============================================================================
// MADHUS BOUTIQUE: ADMIN AUDIT LOGS VIEWER API
// Protected exclusively for SUPER_ADMIN role (view:audit_logs permission)
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { authenticateAdminRequest } from "@/lib/server/adminAuth";
import { getDevAuditLogs } from "@/lib/server/db/audit";
import { createServerServiceClient } from "@/lib/server/db/client";

const isOfflineOrTest =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-project");

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateAdminRequest(req, ["view:audit_logs"]);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    if (isOfflineOrTest) {
      const logs = getDevAuditLogs();
      return NextResponse.json({
        success: true,
        data: logs.reverse(),
      });
    }

    const supabase = createServerServiceClient();
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      throw new Error(`Failed to load audit logs: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load audit logs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
