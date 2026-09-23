import { describe, it, expect } from "vitest";
import {
  assertAdminAuthorized,
  initiateProductPreviewUpload,
  initiateEmbroideryFileUpload,
  initiatePaymentQrUpload,
} from "@/lib/server/s3/operations";
import { generateUploadPresignedUrl, generateDownloadPresignedUrl } from "@/lib/server/s3/presign";

describe("Sprint 3: S3 Authorization & RBAC Enforcement", () => {
  describe("Role-Based Access Control", () => {
    it("rejects unauthorized access when no role is provided", () => {
      expect(() => assertAdminAuthorized(undefined)).toThrow(/UNAUTHORIZED_ACCESS/);
    });

    it("allows authorized admin roles for product asset management", () => {
      expect(() => assertAdminAuthorized("SUPER_ADMIN")).not.toThrow();
      expect(() => assertAdminAuthorized("CONTENT_MANAGER")).not.toThrow();
    });

    it("rejects non-super-admins from modifying payment QR assets", async () => {
      const qrPayload = {
        filename: "new-qr.png",
        content_type: "image/png" as const,
        file_size_bytes: 1024 * 100,
      };

      // CONTENT_MANAGER is not allowed to change payment QR
      await expect(
        initiatePaymentQrUpload(qrPayload, "CONTENT_MANAGER")
      ).rejects.toThrow(/UNAUTHORIZED_ACCESS/);

      // Undefined role rejected
      await expect(
        initiatePaymentQrUpload(qrPayload, undefined)
      ).rejects.toThrow(/UNAUTHORIZED_ACCESS/);
    });

    it("allows SUPER_ADMIN to generate payment QR presigned URL", async () => {
      const qrPayload = {
        filename: "new-qr.png",
        content_type: "image/png" as const,
        file_size_bytes: 1024 * 100,
      };

      const result = await initiatePaymentQrUpload(qrPayload, "SUPER_ADMIN");
      expect(result.uploadUrl).toBeDefined();
      expect(result.key).toMatch(/^payment\/qr\/upi-qr-\d+-[a-f0-9]{8}\.png$/);
      expect(result.expiresInSeconds).toBe(300);
    });

    it("allows CONTENT_MANAGER to generate design file upload presigned URL", async () => {
      const filePayload = {
        product_code: "MB-001",
        format: "DST" as const,
        filename: "temple-border.dst",
        content_type: "application/octet-stream",
        file_size_bytes: 1024 * 50,
      };

      const result = await initiateEmbroideryFileUpload(filePayload, "CONTENT_MANAGER");
      expect(result.uploadUrl).toBeDefined();
      expect(result.key).toMatch(/^products\/MB-001\/files\/DST\/temple-border-[a-f0-9]{8}\.dst$/);
      expect(result.expiresInSeconds).toBe(300);
    });

    it("allows CONTENT_MANAGER to generate preview upload presigned URL", async () => {
      const previewPayload = {
        product_code: "MB-001",
        filename: "temple-preview.png",
        content_type: "image/png" as const,
        file_size_bytes: 1024 * 150,
      };

      const result = await initiateProductPreviewUpload(previewPayload, "CONTENT_MANAGER");
      expect(result.uploadUrl).toBeDefined();
      expect(result.key).toMatch(/^products\/MB-001\/preview\/mb-001-preview-[a-f0-9]{12}\.png$/);
      expect(result.expiresInSeconds).toBe(300);
    });
  });

  describe("Presigned URL Security Constraints", () => {
    it("clamps requested TTL to a safe upper bound (max 3600 seconds)", async () => {
      const result = await generateUploadPresignedUrl({
        key: "products/MB-001/preview/test.png",
        contentType: "image/png",
        expiresInSeconds: 999999, // Attempted excessive TTL
      });

      expect(result.expiresInSeconds).toBe(3600); // Clamped to 1 hour max
    });

    it("clamps requested TTL to a safe lower bound (min 60 seconds)", async () => {
      const result = await generateDownloadPresignedUrl({
        key: "products/MB-001/preview/test.png",
        expiresInSeconds: 5, // Attempted near-instant expiry
      });

      expect(result.expiresInSeconds).toBe(60); // Clamped to 60s min
    });
  });
});
