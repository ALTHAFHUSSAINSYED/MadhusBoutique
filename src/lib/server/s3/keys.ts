// ==============================================================================
// MADHUS BOUTIQUE: S3 OBJECT KEY GENERATOR & PATH TRAVERSAL SANITIZER
// Enforces strict hierarchical structure and zero-trust key building.
// Prevents: Path traversal, arbitrary key injection, and overwrite attacks.
// ==============================================================================

import crypto from "crypto";
import { EmbroideryFormat } from "@/../types/database";

const PRODUCT_CODE_REGEX = /^MB-[A-Z0-9_-]{2,30}$/;
const ORDER_NUMBER_REGEX = /^MB-\d{8}-\d{5}$/;

/**
 * Validates and sanitizes a product code (e.g. "MB-001" or "MB-BRIDAL-PEACOCK").
 * Throws an error on path traversal attempts or invalid format.
 */
export function validateAndSanitizeProductCode(code: string): string {
  if (!code || typeof code !== "string") {
    throw new Error("Invalid product code: code must be a non-empty string.");
  }

  const lower = code.toLowerCase();

  // Reject traversal sequences explicitly (case-insensitive)
  if (
    lower.includes("..") ||
    lower.includes("/") ||
    lower.includes("\\") ||
    lower.includes("%2e") ||
    lower.includes("\0")
  ) {
    throw new Error("Security Alert: Path traversal sequence detected in product code.");
  }

  const trimmed = code.trim().toUpperCase();

  if (!PRODUCT_CODE_REGEX.test(trimmed)) {
    throw new Error(
      `Invalid product code format "${trimmed}". Must start with MB- followed by alphanumeric characters.`
    );
  }

  return trimmed;
}

/**
 * Validates and sanitizes an order number (e.g. "MB-20260923-12345").
 */
export function validateAndSanitizeOrderNumber(orderNumber: string): string {
  if (!orderNumber || typeof orderNumber !== "string") {
    throw new Error("Invalid order number: orderNumber must be a non-empty string.");
  }

  const lower = orderNumber.toLowerCase();

  if (
    lower.includes("..") ||
    lower.includes("/") ||
    lower.includes("\\") ||
    lower.includes("%2e") ||
    lower.includes("\0")
  ) {
    throw new Error("Security Alert: Path traversal sequence detected in order number.");
  }

  const trimmed = orderNumber.trim().toUpperCase();

  if (!ORDER_NUMBER_REGEX.test(trimmed)) {
    throw new Error(
      `Invalid order number format "${trimmed}". Expected MB-YYYYMMDD-XXXXX.`
    );
  }

  return trimmed;
}

/**
 * Sanitizes an upload filename to eliminate directory navigation and non-standard characters.
 */
export function sanitizeUploadFilename(filename: string): { basename: string; extension: string } {
  if (!filename || typeof filename !== "string") {
    throw new Error("Invalid filename: filename must be a non-empty string.");
  }

  const lower = filename.toLowerCase();

  // Reject path traversal attempts immediately
  if (
    lower.includes("..") ||
    lower.includes("/") ||
    lower.includes("\\") ||
    lower.includes("%2e") ||
    lower.includes("\0")
  ) {
    throw new Error("Security Alert: Path traversal sequence detected in filename.");
  }

  // Extract base and extension
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1 || lastDotIndex === 0) {
    throw new Error("Invalid filename: Must include a valid file extension.");
  }

  const rawBase = filename.substring(0, lastDotIndex);
  const rawExt = filename.substring(lastDotIndex + 1).toLowerCase();

  // Sanitize base: allow only alphanumeric, hyphen, underscore
  const safeBase = rawBase.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 60);
  const safeExt = rawExt.replace(/[^a-z0-9]/g, "").slice(0, 10);

  if (!safeBase || !safeExt) {
    throw new Error("Sanitization failed: Filename contains no valid characters.");
  }

  return { basename: safeBase, extension: safeExt };
}

/**
 * Builds deterministic preview image key:
 * products/{product-code}/preview/{uniqueId}.{ext}
 * Unique token protects against browser caching and object overwrite attacks.
 */
export function buildProductPreviewKey(productCode: string, extension: string): string {
  const cleanCode = validateAndSanitizeProductCode(productCode);
  const cleanExt = extension.toLowerCase().replace(/[^a-z0-9]/g, "");
  const nonce = crypto.randomBytes(6).toString("hex");

  return `products/${cleanCode}/preview/${cleanCode.toLowerCase()}-preview-${nonce}.${cleanExt}`;
}

/**
 * Builds deterministic embroidery machine file key:
 * products/{product-code}/files/{FORMAT}/{basename}-{nonce}.{ext}
 */
export function buildEmbroideryFileKey(
  productCode: string,
  format: EmbroideryFormat,
  originalFilename: string
): string {
  const cleanCode = validateAndSanitizeProductCode(productCode);
  const { basename, extension } = sanitizeUploadFilename(originalFilename);
  const nonce = crypto.randomBytes(4).toString("hex");

  return `products/${cleanCode}/files/${format}/${basename}-${nonce}.${extension}`;
}

/**
 * Builds deterministic order download file key:
 * orders/{order-number}/downloads/{basename}.{ext}
 */
export function buildOrderDownloadKey(orderNumber: string, filename: string): string {
  const cleanOrderNum = validateAndSanitizeOrderNumber(orderNumber);
  const { basename, extension } = sanitizeUploadFilename(filename);

  return `orders/${cleanOrderNum}/downloads/${basename}.${extension}`;
}

/**
 * Builds deterministic payment QR key:
 * payment/qr/upi-qr-{timestamp}.{ext}
 */
export function buildPaymentQrKey(extension: string): string {
  const cleanExt = extension.toLowerCase().replace(/[^a-z0-9]/g, "");
  const timestamp = Date.now();
  const nonce = crypto.randomBytes(4).toString("hex");

  return `payment/qr/upi-qr-${timestamp}-${nonce}.${cleanExt}`;
}
