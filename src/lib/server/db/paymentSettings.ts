// ==============================================================================
// MADHUS BOUTIQUE: SERVER-SIDE PAYMENT SETTINGS DATA-ACCESS MODULE
// Handles active UPI ID, merchant name, private S3 QR code & audit tracking
// ==============================================================================

import { createServerServiceClient } from "./client";
import { PaymentSettingRow } from "@/../types/database";
import { UpdatePaymentSettingsInput } from "@/lib/validations/schemas";
import { logAuditAction } from "./audit";
import { generateDownloadPresignedUrl } from "../s3/presign";

const isOfflineOrTest =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-project");

export const DEV_PAYMENT_SETTINGS_STORE = new Map<string, PaymentSettingRow>();

// Seed default active payment settings
DEV_PAYMENT_SETTINGS_STORE.set("active", {
  id: "11111111-1111-1111-1111-111111111111",
  upi_id: process.env.NEXT_PUBLIC_MERCHANT_UPI_ID || "Madhusboutiquenrt@ybl",
  merchant_name: process.env.NEXT_PUBLIC_STORE_NAME || "Madhus Boutique",
  qr_image_s3_key: null,
  is_active: true,
  updated_by: null,
  updated_at: new Date().toISOString(),
});

export interface ActivePaymentSettingsResult {
  id: string;
  upi_id: string;
  merchant_name: string;
  qr_image_s3_key: string | null;
  qr_image_url: string;
  is_active: boolean;
}

/**
 * Returns active UPI ID and presigned GET URL for the private S3 QR code
 */
export async function getActivePaymentSettings(): Promise<ActivePaymentSettingsResult> {
  let record: PaymentSettingRow | null = null;

  if (!isOfflineOrTest) {
    try {
      const supabase = createServerServiceClient();
      const { data, error } = await supabase
        .from("payment_settings")
        .select("*")
        .eq("is_active", true)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        record = data as PaymentSettingRow;
      }
    } catch {
      // Fallback to memory store if connection fails
    }
  }

  if (!record) {
    record = DEV_PAYMENT_SETTINGS_STORE.get("active") || {
      id: "11111111-1111-1111-1111-111111111111",
      upi_id: process.env.NEXT_PUBLIC_MERCHANT_UPI_ID || "Madhusboutiquenrt@ybl",
      merchant_name: process.env.NEXT_PUBLIC_STORE_NAME || "Madhus Boutique",
      qr_image_s3_key: null,
      is_active: true,
      updated_by: null,
      updated_at: new Date().toISOString(),
    };
  }

  // Generate short-lived presigned URL (15 min) for the private QR image if stored in S3
  let qrUrl = "/payment-qr-clean.png";
  if (record.qr_image_s3_key && !record.qr_image_s3_key.includes("default")) {
    try {
      const presigned = await generateDownloadPresignedUrl({
        key: record.qr_image_s3_key,
        expiresInSeconds: 900,
      });
      qrUrl = presigned.downloadUrl;
    } catch {
      // Fallback to authentic payment QR if presigning fails
      qrUrl = "/payment-qr-clean.png";
    }
  }

  return {
    id: record.id,
    upi_id: record.upi_id,
    merchant_name: record.merchant_name,
    qr_image_s3_key: record.qr_image_s3_key,
    qr_image_url: qrUrl,
    is_active: record.is_active,
  };
}

/**
 * Updates active payment settings with new UPI ID, merchant name, or QR S3 key.
 * Appends an audit log entry tracking the change.
 */
export async function updateActivePaymentSettings(
  adminAuthUserId: string,
  input: UpdatePaymentSettingsInput,
  clientIp?: string,
  userAgent?: string
): Promise<ActivePaymentSettingsResult> {
  const currentSettings = await getActivePaymentSettings();

  const updatedRecord: PaymentSettingRow = {
    id: currentSettings.id,
    upi_id: input.upi_id.trim(),
    merchant_name: input.merchant_name.trim(),
    qr_image_s3_key: input.qr_image_s3_key?.trim() || currentSettings.qr_image_s3_key,
    is_active: true,
    updated_by: adminAuthUserId,
    updated_at: new Date().toISOString(),
  };

  // Update in-memory dev store
  DEV_PAYMENT_SETTINGS_STORE.set("active", updatedRecord);

  if (!isOfflineOrTest) {
    const supabase = createServerServiceClient();
    const { error } = await supabase
      .from("payment_settings")
      .update({
        upi_id: updatedRecord.upi_id,
        merchant_name: updatedRecord.merchant_name,
        qr_image_s3_key: updatedRecord.qr_image_s3_key,
        updated_by: adminAuthUserId,
      })
      .eq("id", currentSettings.id);

    if (error) {
      throw new Error(`Failed to update payment settings in database: ${error.message}`);
    }
  }

  // Create immutable audit log for payment configuration change
  await logAuditAction(
    adminAuthUserId,
    "PAYMENT_SETTINGS_UPDATED",
    "payment_settings",
    currentSettings.id,
    {
      previous: {
        upi_id: currentSettings.upi_id,
        merchant_name: currentSettings.merchant_name,
        qr_image_s3_key: currentSettings.qr_image_s3_key,
      },
      updated: {
        upi_id: updatedRecord.upi_id,
        merchant_name: updatedRecord.merchant_name,
        qr_image_s3_key: updatedRecord.qr_image_s3_key,
      },
    },
    clientIp,
    userAgent
  );

  return getActivePaymentSettings();
}
