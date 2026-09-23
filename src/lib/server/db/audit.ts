// ==============================================================================
// MADHUS BOUTIQUE: SERVER-SIDE AUDIT LOGGING MODULE
// Append-only tamper-evident audit trail for administrative actions
// ==============================================================================

import { createServerServiceClient } from "./client";
import { AuditLogRow } from "@/../types/database";

const isOfflineOrTest =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-project");

export const DEV_AUDIT_LOGS_STORE: AuditLogRow[] = [];

export function getDevAuditLogs(): AuditLogRow[] {
  return [...DEV_AUDIT_LOGS_STORE];
}

export function clearDevAuditLogs(): void {
  DEV_AUDIT_LOGS_STORE.length = 0;
}

export async function logAuditAction(
  adminUserId: string | null,
  action: string,
  entityType: string,
  entityId: string | null,
  metadata: Record<string, unknown> = {},
  ipAddress?: string | null,
  userAgent?: string | null
): Promise<void> {
  const entry: AuditLogRow = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    admin_user_id: adminUserId,
    action: action.toUpperCase(),
    entity_type: entityType.toLowerCase(),
    entity_id: entityId,
    metadata,
    ip_address: ipAddress || null,
    user_agent: userAgent || null,
    created_at: new Date().toISOString(),
  };

  // Always store in memory for tracking & test verification
  DEV_AUDIT_LOGS_STORE.push(entry);

  if (isOfflineOrTest) {
    return;
  }

  try {
    const supabase = createServerServiceClient();
    await supabase.from("audit_logs").insert({
      admin_user_id: adminUserId,
      action: action.toUpperCase(),
      entity_type: entityType.toLowerCase(),
      entity_id: entityId,
      metadata: metadata,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
    });
  } catch (err) {
    // Audit logging failure should be recorded to server error console
    console.error("CRITICAL: Failed to write audit log entry:", err);
  }
}
