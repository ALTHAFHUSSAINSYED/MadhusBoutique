import { describe, it, expect } from "vitest";
import {
  previewUploadInputSchema,
  embroideryFileUploadInputSchema,
  paymentQrUploadInputSchema,
  validateEmbroideryFormatExtension,
  MAX_PREVIEW_SIZE_BYTES,
  MAX_EMBROIDERY_FILE_SIZE_BYTES,
  MAX_QR_SIZE_BYTES,
} from "@/lib/server/s3/validation";

describe("Sprint 3: S3 Asset Validation & Format Rules", () => {
  describe("Preview Image Validation", () => {
    it("accepts valid preview image metadata within size bounds", () => {
      const valid = {
        product_code: "MB-001",
        filename: "lotus-motif.png",
        content_type: "image/png" as const,
        file_size_bytes: 1024 * 500, // 500 KB
      };
      expect(previewUploadInputSchema.safeParse(valid).success).toBe(true);
    });

    it("rejects preview images exceeding the 5 MB limit", () => {
      const oversized = {
        product_code: "MB-001",
        filename: "huge-image.jpg",
        content_type: "image/jpeg" as const,
        file_size_bytes: MAX_PREVIEW_SIZE_BYTES + 1,
      };
      const result = previewUploadInputSchema.safeParse(oversized);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("cannot exceed 5 MB");
      }
    });

    it("rejects unsupported MIME types for preview images", () => {
      const badMime = {
        product_code: "MB-001",
        filename: "script.js",
        content_type: "application/javascript",
        file_size_bytes: 1024,
      };
      expect(previewUploadInputSchema.safeParse(badMime).success).toBe(false);
    });
  });

  describe("Embroidery File Validation", () => {
    it("accepts valid embroidery design formats within size bounds", () => {
      const validDst = {
        product_code: "MB-002",
        format: "DST" as const,
        filename: "peacock-yoke.dst",
        content_type: "application/octet-stream",
        file_size_bytes: 1024 * 1024 * 2, // 2 MB
      };
      expect(embroideryFileUploadInputSchema.safeParse(validDst).success).toBe(true);
    });

    it("rejects embroidery files exceeding the 15 MB limit", () => {
      const oversized = {
        product_code: "MB-002",
        format: "PES" as const,
        filename: "heavy-embroidery.pes",
        file_size_bytes: MAX_EMBROIDERY_FILE_SIZE_BYTES + 1,
      };
      const result = embroideryFileUploadInputSchema.safeParse(oversized);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("cannot exceed 15 MB");
      }
    });

    it("rejects unknown embroidery formats", () => {
      const invalidFormat = {
        product_code: "MB-002",
        format: "EXE",
        filename: "payload.exe",
        file_size_bytes: 5000,
      };
      expect(embroideryFileUploadInputSchema.safeParse(invalidFormat).success).toBe(false);
    });

    it("strictly verifies that file extension matches declared machine format", () => {
      expect(validateEmbroideryFormatExtension("DST", "dst")).toBe(true);
      expect(validateEmbroideryFormatExtension("PES", "pes")).toBe(true);
      expect(validateEmbroideryFormatExtension("JEF", "jef")).toBe(true);
      expect(validateEmbroideryFormatExtension("EXP", "exp")).toBe(true);

      // Mismatch attempts
      expect(validateEmbroideryFormatExtension("DST", "pes")).toBe(false);
      expect(validateEmbroideryFormatExtension("DST", "exe")).toBe(false);
      expect(validateEmbroideryFormatExtension("PES", "jpg")).toBe(false);
    });
  });

  describe("Payment QR Validation", () => {
    it("accepts valid QR image within 2 MB", () => {
      const validQr = {
        filename: "upi-qr.png",
        content_type: "image/png" as const,
        file_size_bytes: 1024 * 200, // 200 KB
      };
      expect(paymentQrUploadInputSchema.safeParse(validQr).success).toBe(true);
    });

    it("rejects QR images exceeding 2 MB", () => {
      const oversizedQr = {
        filename: "upi-qr.png",
        content_type: "image/png" as const,
        file_size_bytes: MAX_QR_SIZE_BYTES + 100,
      };
      expect(paymentQrUploadInputSchema.safeParse(oversizedQr).success).toBe(false);
    });
  });
});
