// ==============================================================================
// MADHUS BOUTIQUE: S3 HIGH-LEVEL OPERATIONS & RBAC ENFORCEMENT
// ==============================================================================

import { AdminRole, EmbroideryFormat } from "@/../types/database";
import {
  buildProductPreviewKey,
  buildEmbroideryFileKey,
  buildPaymentQrKey,
  sanitizeUploadFilename,
} from "./keys";
import {
  previewUploadInputSchema,
  embroideryFileUploadInputSchema,
  paymentQrUploadInputSchema,
  validateEmbroideryFormatExtension,
  PreviewUploadInput,
  EmbroideryFileUploadInput,
  PaymentQrUploadInput,
} from "./validation";
import {
  generateUploadPresignedUrl,
  generateDownloadPresignedUrl,
  deleteS3Object,
  getS3ObjectMetadata,
} from "./presign";

/**
 * Validates admin role authorization for digital asset modifications
 */
export function assertAdminAuthorized(
  role: AdminRole | undefined,
  allowedRoles: AdminRole[] = ["SUPER_ADMIN", "CONTENT_MANAGER"]
): void {
  if (!role || !allowedRoles.includes(role)) {
    throw new Error(
      "UNAUTHORIZED_ACCESS: Insufficient permissions. Requires an admin role with digital asset management privileges."
    );
  }
}

/**
 * Initiates product preview image upload with full RBAC and path defense
 */
export async function initiateProductPreviewUpload(
  input: PreviewUploadInput,
  userRole?: AdminRole
): Promise<{ uploadUrl: string; key: string; expiresInSeconds: number }> {
  // 1. Enforce RBAC
  assertAdminAuthorized(userRole, ["SUPER_ADMIN", "CONTENT_MANAGER"]);

  // 2. Validate input schema
  const validated = previewUploadInputSchema.parse(input);

  // 3. Sanitize filename & extension
  const { extension } = sanitizeUploadFilename(validated.filename);

  // 4. Build secure private S3 key
  const key = buildProductPreviewKey(validated.product_code, extension);

  // 5. Generate upload presigned URL (5 minutes validity)
  return await generateUploadPresignedUrl({
    key,
    contentType: validated.content_type,
    expiresInSeconds: 300,
  });
}

/**
 * Initiates embroidery design file upload (DST, PES, JEF, EXP)
 */
export async function initiateEmbroideryFileUpload(
  input: EmbroideryFileUploadInput,
  userRole?: AdminRole
): Promise<{ uploadUrl: string; key: string; expiresInSeconds: number }> {
  // 1. Enforce RBAC
  assertAdminAuthorized(userRole, ["SUPER_ADMIN", "CONTENT_MANAGER"]);

  // 2. Validate input schema
  const validated = embroideryFileUploadInputSchema.parse(input);

  // 3. Sanitize filename
  const { extension } = sanitizeUploadFilename(validated.filename);

  // 4. Verify extension matches format
  if (!validateEmbroideryFormatExtension(validated.format as EmbroideryFormat, extension)) {
    throw new Error(
      `Format mismatch: File extension ".${extension}" does not match declared format "${validated.format}".`
    );
  }

  // 5. Build secure private S3 key
  const key = buildEmbroideryFileKey(
    validated.product_code,
    validated.format as EmbroideryFormat,
    validated.filename
  );

  // 6. Generate upload presigned URL
  return await generateUploadPresignedUrl({
    key,
    contentType: validated.content_type || "application/octet-stream",
    expiresInSeconds: 300,
  });
}

/**
 * Initiates payment QR code upload
 */
export async function initiatePaymentQrUpload(
  input: PaymentQrUploadInput,
  userRole?: AdminRole
): Promise<{ uploadUrl: string; key: string; expiresInSeconds: number }> {
  // 1. Super Admin only
  assertAdminAuthorized(userRole, ["SUPER_ADMIN"]);

  // 2. Validate input schema
  const validated = paymentQrUploadInputSchema.parse(input);

  // 3. Sanitize filename
  const { extension } = sanitizeUploadFilename(validated.filename);

  // 4. Build secure private S3 key
  const key = buildPaymentQrKey(extension);

  // 5. Generate upload presigned URL
  return await generateUploadPresignedUrl({
    key,
    contentType: validated.content_type,
    expiresInSeconds: 300,
  });
}

/**
 * Generates a temporary presigned URL to view a product preview
 */
export async function getSecurePreviewUrl(
  previewKey: string
): Promise<{ previewUrl: string; expiresInSeconds: number }> {
  if (!previewKey || !previewKey.startsWith("products/")) {
    throw new Error("Invalid preview key: Must be within products/ directory.");
  }

  const { downloadUrl, expiresInSeconds } = await generateDownloadPresignedUrl({
    key: previewKey,
    expiresInSeconds: 900, // 15 mins
  });

  return {
    previewUrl: downloadUrl,
    expiresInSeconds,
  };
}

/**
 * Admin deletion of an embroidery or preview asset
 */
export async function deleteProductAsset(key: string, userRole?: AdminRole): Promise<boolean> {
  assertAdminAuthorized(userRole, ["SUPER_ADMIN"]);

  if (!key.startsWith("products/")) {
    throw new Error("Security Alert: Only product assets can be deleted via this operation.");
  }

  return await deleteS3Object(key);
}

export { getS3ObjectMetadata };
