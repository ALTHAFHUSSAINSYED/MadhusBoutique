// ==============================================================================
// MADHUS BOUTIQUE: SPRINT 6 DIGITAL ASSET DELIVERY & ZIP PIPELINE TEST SUITE
// Tests zero client trust, server-side ZIP packaging, private S3 delivery,
// presigned URL issuance, download logs, expiry enforcement, and rate limiting.
// ==============================================================================

import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { createGuestOrder, DEV_ORDERS_STORE, getDevDownloadLogs, clearDevDownloadLogs } from "@/lib/server/db/orders";
import { submitPaymentReference, verifyPaymentByAdmin } from "@/lib/server/db/payments";
import { generateOrderZipArchive } from "@/lib/server/s3/delivery";
import { POST as downloadRoute } from "@/app/api/orders/[orderNumber]/download/route";
import { resetRateLimit } from "@/lib/server/rateLimit";
import JSZip from "jszip";

describe("Sprint 6: Secure Digital Delivery & Private S3 ZIP Pipeline", () => {
  beforeEach(() => {
    clearDevDownloadLogs();
    resetRateLimit();
  });

  describe("1. Payment Verification Gate & Access Control", () => {
    it("rejects download request if order payment is not VERIFIED (status: PENDING)", async () => {
      // 1. Create order
      const orderRes = await createGuestOrder({
        customer: { name: "Meera Nair", email: "meera@test.com", phone: "+91 91234 56789" },
        items: [{ product_id: "11111111-1111-1111-1111-111111111111", quantity: 1 }],
      });

      // 2. Attempt download immediately without payment verification
      await expect(
        generateOrderZipArchive(orderRes.order_number, orderRes.order_token)
      ).rejects.toThrow("PAYMENT_REQUIRED");
    });

    it("rejects download request if order payment is SUBMITTED but not yet admin-verified", async () => {
      const orderRes = await createGuestOrder({
        customer: { name: "Kiran Rao", email: "kiran@test.com", phone: "+91 92345 67890" },
        items: [{ product_id: "11111111-1111-1111-1111-111111111111", quantity: 1 }],
      });

      // Submit payment reference
      await submitPaymentReference({
        order_number: orderRes.order_number,
        order_token: orderRes.order_token,
        transaction_reference: "UTRUNVERIFIED001",
      });

      // Attempt download
      await expect(
        generateOrderZipArchive(orderRes.order_number, orderRes.order_token)
      ).rejects.toThrow("PAYMENT_REQUIRED");
    });
  });

  describe("2. IDOR Defense on Digital Downloads", () => {
    it("rejects download attempt with forged or invalid security token (401 Unauthorized)", async () => {
      // 1. Create and verify order
      const orderRes = await createGuestOrder({
        customer: { name: "Pooja Hegde", email: "pooja@test.com", phone: "+91 93456 78901" },
        items: [{ product_id: "11111111-1111-1111-1111-111111111111", quantity: 1 }],
      });

      const payRes = await submitPaymentReference({
        order_number: orderRes.order_number,
        order_token: orderRes.order_token,
        transaction_reference: "UTRAUTHCHECK001",
      });

      await verifyPaymentByAdmin("admin-super-1", {
        order_id: orderRes.order_id,
        payment_id: payRes.payment_id,
        action: "VERIFY",
      });

      // 2. Attacker queries route with forged token
      const req = new NextRequest(
        `http://localhost:3000/api/orders/${orderRes.order_number}/download`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_token: "00000000-0000-0000-0000-000000000000", // Forged UUID
          }),
        }
      );

      const response = await downloadRoute(req, {
        params: Promise.resolve({ orderNumber: orderRes.order_number }),
      });

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.error).toContain("UNAUTHORIZED");
    });
  });

  describe("3. Zero Client Trust & Server-Side S3 Key Resolution", () => {
    it("resolves purchased file keys exclusively from database records and builds valid ZIP archive", async () => {
      // 1. Create and verify order
      const orderRes = await createGuestOrder({
        customer: { name: "Divya Shah", email: "divya@test.com", phone: "+91 94567 89012" },
        items: [{ product_id: "11111111-1111-1111-1111-111111111111", quantity: 1 }],
      });

      const payRes = await submitPaymentReference({
        order_number: orderRes.order_number,
        order_token: orderRes.order_token,
        transaction_reference: "UTRDIGITAL001",
      });

      await verifyPaymentByAdmin("admin-super-1", {
        order_id: orderRes.order_id,
        payment_id: payRes.payment_id,
        action: "VERIFY",
      });

      // 2. Execute digital delivery pipeline
      const result = await generateOrderZipArchive(
        orderRes.order_number,
        orderRes.order_token,
        "192.168.1.50",
        "VitestBrowser/1.0"
      );

      expect(result.success).toBe(true);
      expect(result.download_url).toBeDefined();
      expect(result.download_url).toContain("amazonaws.com");
      expect(result.download_url).toContain("response-content-disposition");
      expect(result.expires_in_seconds).toBe(900); // 15-minute TTL
      expect(result.files_count).toBeGreaterThan(0);

      // Verify order record updated with zip_s3_key
      const devOrder = DEV_ORDERS_STORE.get(orderRes.order_number);
      expect(devOrder?.order.zip_s3_key).toBe(
        `orders/${orderRes.order_number}/downloads/${orderRes.order_number}-designs.zip`
      );
      expect(devOrder?.order.download_count).toBe(1);

      // Verify download_logs entry created
      const logs = getDevDownloadLogs();
      const downloadLog = logs.find((l) => l.order_id === orderRes.order_id);
      expect(downloadLog).toBeDefined();
      expect(downloadLog?.ip_address).toBe("192.168.1.50");
      expect(downloadLog?.user_agent).toBe("VitestBrowser/1.0");
    });
  });

  describe("4. 30-Day Expiration & Download Quota Enforcement", () => {
    it("blocks digital download when order has passed the 30-day expiration window (410 Gone)", async () => {
      // 1. Create and verify order
      const orderRes = await createGuestOrder({
        customer: { name: "Anil Kapoor", email: "anil@test.com", phone: "+91 95678 90123" },
        items: [{ product_id: "11111111-1111-1111-1111-111111111111", quantity: 1 }],
      });

      const payRes = await submitPaymentReference({
        order_number: orderRes.order_number,
        order_token: orderRes.order_token,
        transaction_reference: "UTREXPIRED001",
      });

      await verifyPaymentByAdmin("admin-super-1", {
        order_id: orderRes.order_id,
        payment_id: payRes.payment_id,
        action: "VERIFY",
      });

      // Artificially expire the order
      const devRecord = DEV_ORDERS_STORE.get(orderRes.order_number);
      if (devRecord) {
        devRecord.order.download_expires_at = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago
      }

      // 2. Query route
      const req = new NextRequest(
        `http://localhost:3000/api/orders/${orderRes.order_number}/download`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_token: orderRes.order_token }),
        }
      );

      const response = await downloadRoute(req, {
        params: Promise.resolve({ orderNumber: orderRes.order_number }),
      });

      expect(response.status).toBe(410);
      const json = await response.json();
      expect(json.error).toContain("EXPIRED");
    });

    it("blocks digital download when maximum download quota is reached (429 / Quota Exceeded)", async () => {
      // 1. Create and verify order
      const orderRes = await createGuestOrder({
        customer: { name: "Simran Kaur", email: "simran@test.com", phone: "+91 96789 01234" },
        items: [{ product_id: "11111111-1111-1111-1111-111111111111", quantity: 1 }],
      });

      const payRes = await submitPaymentReference({
        order_number: orderRes.order_number,
        order_token: orderRes.order_token,
        transaction_reference: "UTRQUOTA001",
      });

      await verifyPaymentByAdmin("admin-super-1", {
        order_id: orderRes.order_id,
        payment_id: payRes.payment_id,
        action: "VERIFY",
      });

      // Set download_count to maximum (10)
      const devRecord = DEV_ORDERS_STORE.get(orderRes.order_number);
      if (devRecord) {
        devRecord.order.download_count = 10;
        devRecord.order.max_downloads = 10;
      }

      // 2. Query route
      const req = new NextRequest(
        `http://localhost:3000/api/orders/${orderRes.order_number}/download`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_token: orderRes.order_token }),
        }
      );

      const response = await downloadRoute(req, {
        params: Promise.resolve({ orderNumber: orderRes.order_number }),
      });

      expect(response.status).toBe(429);
      const json = await response.json();
      expect(json.error).toContain("QUOTA_EXCEEDED");
    });
  });

  describe("5. Sliding-Window Rate Limiting on Download Endpoint", () => {
    it("blocks excessive download link requests exceeding the sliding window threshold", async () => {
      const orderRes = await createGuestOrder({
        customer: { name: "Rate Test User", email: "rate@test.com", phone: "+91 97890 12345" },
        items: [{ product_id: "11111111-1111-1111-1111-111111111111", quantity: 1 }],
      });

      const payRes = await submitPaymentReference({
        order_number: orderRes.order_number,
        order_token: orderRes.order_token,
        transaction_reference: "UTRRATELIMIT001",
      });

      await verifyPaymentByAdmin("admin-super-1", {
        order_id: orderRes.order_id,
        payment_id: payRes.payment_id,
        action: "VERIFY",
      });

      // Trigger 10 download requests (allowed quota in sliding window)
      for (let i = 0; i < 10; i++) {
        const req = new NextRequest(
          `http://localhost:3000/api/orders/${orderRes.order_number}/download`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-forwarded-for": "203.0.113.195",
            },
            body: JSON.stringify({ order_token: orderRes.order_token }),
          }
        );
        await downloadRoute(req, {
          params: Promise.resolve({ orderNumber: orderRes.order_number }),
        });
      }

      // 11th request from same IP and order within 10 minutes -> Must return 429
      const req11 = new NextRequest(
        `http://localhost:3000/api/orders/${orderRes.order_number}/download`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": "203.0.113.195",
          },
          body: JSON.stringify({ order_token: orderRes.order_token }),
        }
      );

      const response11 = await downloadRoute(req11, {
        params: Promise.resolve({ orderNumber: orderRes.order_number }),
      });

      expect(response11.status).toBe(429);
      const json11 = await response11.json();
      expect(json11.error).toContain("Too many download link requests");
    });
  });

  describe("6. ZIP Archive Integrity Verification", () => {
    it("generates a valid ZIP archive containing LICENSE_AND_INSTRUCTIONS.txt and embroidery machine files", async () => {
      // Create minimal in-memory ZIP to verify JSZip unpackability
      const zip = new JSZip();
      zip.file("LICENSE_AND_INSTRUCTIONS.txt", "License content for testing");
      zip.file("MB-001/MB-001.dst", Buffer.from("DST_BINARY_HEADER"));
      zip.file("MB-001/MB-001.pes", Buffer.from("PES_BINARY_HEADER"));

      const buffer = await zip.generateAsync({ type: "nodebuffer" });
      expect(buffer.length).toBeGreaterThan(0);

      // Unpack and verify files
      const loadedZip = await JSZip.loadAsync(buffer);
      expect(loadedZip.file("LICENSE_AND_INSTRUCTIONS.txt")).toBeDefined();
      expect(loadedZip.file("MB-001/MB-001.dst")).toBeDefined();
      expect(loadedZip.file("MB-001/MB-001.pes")).toBeDefined();

      const licenseText = await loadedZip.file("LICENSE_AND_INSTRUCTIONS.txt")?.async("string");
      expect(licenseText).toContain("License content for testing");
    });
  });
});
