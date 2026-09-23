// ==============================================================================
// MADHUS BOUTIQUE: S3 ASSET VALIDATION SCHEMAS & UTILITIES
// Enforces MIME types, file extensions, and byte-size thresholds
// ==============================================================================

import { z } from "zod";
import { EmbroideryFormat } from "@/../types/database";

// Allowed MIME types and extensions
export const ALLOWED_PREVIEW_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
] as const;

export const ALLOWED_PREVIEW_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "svg"] as const;

export const ALLOWED_EMBROIDERY_FORMATS: EmbroideryFormat[] = ["DST", "PES", "JEF", "EXP"];

export const ALLOWED_EMBROIDERY_EXTENSIONS = ["dst", "pes", "jef", "exp"] as const;

export const ALLOWED_QR_MIMES = ["image/jpeg", "image/png", "image/webp"] as const;

// Size limits in bytes
export const MAX_PREVIEW_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_EMBROIDERY_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB
export const MAX_QR_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

/**
 * Preview image upload request validation schema
 */
export const previewUploadInputSchema = z.object({
  product_code: z
    .string()
    .min(3)
    .max(30)
    .regex(/^MB-[A-Z0-9_-]+$/, "Product code must start with MB- followed by uppercase alphanumeric characters."),
  filename: z.string().min(3).max(100),
  content_type: z.enum(ALLOWED_PREVIEW_MIMES, {
    message: "Invalid image MIME type. Only JPEG, PNG, WebP, and SVG are supported.",
  }),
  file_size_bytes: z
    .number()
    .int()
    .positive()
    .max(MAX_PREVIEW_SIZE_BYTES, `Preview image size cannot exceed ${MAX_PREVIEW_SIZE_BYTES / (1024 * 1024)} MB.`),
});

export type PreviewUploadInput = z.infer<typeof previewUploadInputSchema>;

/**
 * Embroidery file upload request validation schema
 */
export const embroideryFileUploadInputSchema = z.object({
  product_code: z
    .string()
    .min(3)
    .max(30)
    .regex(/^MB-[A-Z0-9_-]+$/, "Product code must start with MB- followed by uppercase alphanumeric characters."),
  format: z.enum(["DST", "PES", "JEF", "EXP"] as const, {
    message: "Format must be one of DST, PES, JEF, or EXP.",
  }),
  filename: z.string().min(3).max(100),
  content_type: z.string().default("application/octet-stream"),
  file_size_bytes: z
    .number()
    .int()
    .positive()
    .max(
      MAX_EMBROIDERY_FILE_SIZE_BYTES,
      `Embroidery design file cannot exceed ${MAX_EMBROIDERY_FILE_SIZE_BYTES / (1024 * 1024)} MB.`
    ),
  stitch_count: z.number().int().positive().optional(),
});

export type EmbroideryFileUploadInput = z.infer<typeof embroideryFileUploadInputSchema>;

/**
 * Payment QR upload validation schema
 */
export const paymentQrUploadInputSchema = z.object({
  filename: z.string().min(3).max(100),
  content_type: z.enum(ALLOWED_QR_MIMES, {
    message: "Invalid QR code MIME type. Only JPEG, PNG, and WebP are supported.",
  }),
  file_size_bytes: z
    .number()
    .int()
    .positive()
    .max(MAX_QR_SIZE_BYTES, `Payment QR image cannot exceed ${MAX_QR_SIZE_BYTES / (1024 * 1024)} MB.`),
});

export type PaymentQrUploadInput = z.infer<typeof paymentQrUploadInputSchema>;

/**
 * Validates that the file extension matches the declared embroidery format
 */
export function validateEmbroideryFormatExtension(format: EmbroideryFormat, extension: string): boolean {
  return format.toLowerCase() === extension.toLowerCase();
}
