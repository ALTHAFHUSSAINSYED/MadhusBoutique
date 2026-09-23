import { describe, it, expect } from "vitest";
import {
  validateAndSanitizeProductCode,
  validateAndSanitizeOrderNumber,
  sanitizeUploadFilename,
  buildProductPreviewKey,
  buildEmbroideryFileKey,
  buildOrderDownloadKey,
  buildPaymentQrKey,
} from "@/lib/server/s3/keys";

describe("Sprint 3: S3 Key Sanitization & Path Traversal Defense", () => {
  describe("Product Code Sanitization", () => {
    it("accepts valid product codes and standardizes casing", () => {
      expect(validateAndSanitizeProductCode("mb-001")).toBe("MB-001");
      expect(validateAndSanitizeProductCode("MB-BRIDAL-PEACOCK")).toBe("MB-BRIDAL-PEACOCK");
      expect(validateAndSanitizeProductCode("MB-BLOUSE_02")).toBe("MB-BLOUSE_02");
    });

    it("rejects path traversal attempts in product codes", () => {
      expect(() => validateAndSanitizeProductCode("../MB-001")).toThrow(/Path traversal/);
      expect(() => validateAndSanitizeProductCode("..\\MB-001")).toThrow(/Path traversal/);
      expect(() => validateAndSanitizeProductCode("MB-001/../../secrets")).toThrow(/Path traversal/);
      expect(() => validateAndSanitizeProductCode("MB-001%2e%2e")).toThrow(/Path traversal/);
      expect(() => validateAndSanitizeProductCode("MB-001\0")).toThrow(/Path traversal/);
    });

    it("rejects non-standard product code formats", () => {
      expect(() => validateAndSanitizeProductCode("INVALID-001")).toThrow(/Invalid product code format/);
      expect(() => validateAndSanitizeProductCode("MB-")).toThrow(/Invalid product code format/);
      expect(() => validateAndSanitizeProductCode("")).toThrow(/non-empty string/);
    });
  });

  describe("Order Number Sanitization", () => {
    it("accepts valid order numbers", () => {
      expect(validateAndSanitizeOrderNumber("MB-20260923-12345")).toBe("MB-20260923-12345");
    });

    it("rejects path traversal sequences in order numbers", () => {
      expect(() => validateAndSanitizeOrderNumber("../../MB-20260923-12345")).toThrow(/Path traversal/);
      expect(() => validateAndSanitizeOrderNumber("MB-20260923-12345/..")).toThrow(/Path traversal/);
    });

    it("rejects malformed order numbers", () => {
      expect(() => validateAndSanitizeOrderNumber("ORDER-123")).toThrow(/Invalid order number format/);
      expect(() => validateAndSanitizeOrderNumber("MB-2026-123")).toThrow(/Invalid order number format/);
    });
  });

  describe("Filename Sanitization", () => {
    it("strips path separators and extracts safe base and extension", () => {
      const result = sanitizeUploadFilename("bridal-motif.DST");
      expect(result.basename).toBe("bridal-motif");
      expect(result.extension).toBe("dst");
    });

    it("rejects filenames containing directory traversal elements", () => {
      expect(() => sanitizeUploadFilename("../malicious.dst")).toThrow(/Path traversal/);
      expect(() => sanitizeUploadFilename("..\\malicious.dst")).toThrow(/Path traversal/);
      expect(() => sanitizeUploadFilename("/etc/passwd.dst")).toThrow(/Path traversal/);
      expect(() => sanitizeUploadFilename("payload%2e%2e.dst")).toThrow(/Path traversal/);
    });

    it("rejects extensionless filenames", () => {
      expect(() => sanitizeUploadFilename("bridal-motif")).toThrow(/Must include a valid file extension/);
      expect(() => sanitizeUploadFilename(".hiddenfile")).toThrow(/Must include a valid file extension/);
    });
  });

  describe("Hierarchical Key Generation & Overwrite Protection", () => {
    it("generates deterministic preview key with unique nonce", () => {
      const key1 = buildProductPreviewKey("MB-001", "png");
      const key2 = buildProductPreviewKey("MB-001", "png");

      expect(key1).toMatch(/^products\/MB-001\/preview\/mb-001-preview-[a-f0-9]{12}\.png$/);
      // Nonces ensure subsequent uploads do not overwrite previous assets
      expect(key1).not.toBe(key2);
    });

    it("generates structured embroidery file key under machine format subfolder", () => {
      const key = buildEmbroideryFileKey("MB-001", "DST", "peacock-yoke.dst");
      expect(key).toMatch(/^products\/MB-001\/files\/DST\/peacock-yoke-[a-f0-9]{8}\.dst$/);
    });

    it("generates structured order download key", () => {
      const key = buildOrderDownloadKey("MB-20260923-12345", "MB-20260923-12345-designs.zip");
      expect(key).toBe("orders/MB-20260923-12345/downloads/MB-20260923-12345-designs.zip");
    });

    it("generates structured payment QR key with timestamp and nonce", () => {
      const key = buildPaymentQrKey("png");
      expect(key).toMatch(/^payment\/qr\/upi-qr-\d+-[a-f0-9]{8}\.png$/);
    });
  });
});
