// ==============================================================================
// MADHUS BOUTIQUE: SPRINT 5 PAYMENT WORKFLOW & VERIFICATION TEST SUITE
// Tests UPI QR settings, elevated auth, UTR submission, admin verification,
// duplicate verification prevention, rate limiting, and audit logging.
// ==============================================================================

import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { getActivePaymentSettings, DEV_PAYMENT_SETTINGS_STORE } from "@/lib/server/db/paymentSettings";
import { createGuestOrder, DEV_ORDERS_STORE } from "@/lib/server/db/orders";
import {
  submitPaymentReference,
  verifyPaymentByAdmin,
  DEV_PAYMENTS_STORE,
  clearDevPayments,
} from "@/lib/server/db/payments";
import { getDevAuditLogs, clearDevAuditLogs } from "@/lib/server/db/audit";
import { checkRateLimit, resetRateLimit } from "@/lib/server/rateLimit";
import { GET as getActiveSettingsRoute } from "@/app/api/payment-settings/active/route";
import { POST as updateSettingsRoute } from "@/app/api/admin/payment-settings/route";
import { POST as verifyPaymentRoute } from "@/app/api/admin/payments/verify/route";
import { POST as submitPaymentRoute } from "@/app/api/payments/submit/route";

describe("Sprint 5: UPI Payment Workflow, QR Management & Admin Verification", () => {
  beforeEach(() => {
    clearDevPayments();
    clearDevAuditLogs();
    resetRateLimit();

    // Reset default payment settings
    DEV_PAYMENT_SETTINGS_STORE.set("active", {
      id: "11111111-1111-1111-1111-111111111111",
      upi_id: "madhusboutique@upi",
      merchant_name: "Madhus Boutique",
      qr_image_s3_key: "payment/qr/upi-qr-default.png",
      is_active: true,
      updated_by: null,
      updated_at: new Date().toISOString(),
    });
  });

  describe("1. Database Payment Settings & Active QR Presentation", () => {
    it("returns active database UPI ID, merchant name, and presigned QR URL", async () => {
      const settings = await getActivePaymentSettings();

      expect(settings.upi_id).toBe("madhusboutique@upi");
      expect(settings.merchant_name).toBe("Madhus Boutique");
      expect(settings.qr_image_url).toBeDefined();
      expect(settings.is_active).toBe(true);
    });

    it("public API endpoint GET /api/payment-settings/active serves current settings", async () => {
      const response = await getActiveSettingsRoute();
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.upi_id).toBe("madhusboutique@upi");
    });
  });

  describe("2. Protected QR Modification & Elevated Authentication", () => {
    it("rejects QR update if unauthenticated (missing admin role)", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/payment-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          upi_id: "newupi@okaxis",
          merchant_name: "Madhus Boutique Updated",
        }),
      });

      const response = await updateSettingsRoute(req);
      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.error).toContain("Missing administrative credentials");
    });

    it("rejects QR update if caller has insufficient admin role (e.g. ORDER_MANAGER)", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/payment-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-role": "ORDER_MANAGER",
        },
        body: JSON.stringify({
          upi_id: "newupi@okaxis",
          merchant_name: "Madhus Boutique Updated",
        }),
      });

      const response = await updateSettingsRoute(req);
      expect(response.status).toBe(403);
      const json = await response.json();
      expect(json.error).toContain("Requires one of [SUPER_ADMIN]");
    });

    it("rejects QR update by SUPER_ADMIN without elevated authentication (MFA)", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/payment-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-role": "SUPER_ADMIN",
        },
        body: JSON.stringify({
          upi_id: "newupi@okaxis",
          merchant_name: "Madhus Boutique Updated",
        }),
      });

      const response = await updateSettingsRoute(req);
      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.error).toContain("Elevated MFA");
    });

    it("allows QR update with SUPER_ADMIN and valid elevated token, emitting an audit log", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/payment-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-role": "SUPER_ADMIN",
          "x-admin-id": "superadmin-uuid-1",
          "x-admin-elevated-token": "elevated-mfa-session-valid",
          "user-agent": "Vitest/TestAgent",
        },
        body: JSON.stringify({
          upi_id: "updatedmadhus@icici",
          merchant_name: "Madhus Boutique Luxury",
          qr_image_s3_key: "payment/qr/upi-qr-20260923-new.png",
        }),
      });

      const response = await updateSettingsRoute(req);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.upi_id).toBe("updatedmadhus@icici");

      // Verify Audit Log was recorded
      const logs = getDevAuditLogs();
      const qrLog = logs.find((l) => l.action === "PAYMENT_SETTINGS_UPDATED");
      expect(qrLog).toBeDefined();
      expect(qrLog?.entity_type).toBe("payment_settings");
      expect(qrLog?.admin_user_id).toBe("superadmin-uuid-1");
      const metadata = qrLog?.metadata as Record<string, Record<string, unknown>>;
      expect(metadata?.updated?.upi_id).toBe("updatedmadhus@icici");
    });
  });

  describe("3. Customer UTR Submission & Zero-Trust Pricing", () => {
    it("creates payment with status SUBMITTED and binds amount strictly to order total", async () => {
      // 1. Create an order with official price ₹499
      const orderRes = await createGuestOrder({
        customer: {
          name: "Sanya Roy",
          email: "sanya@example.com",
          phone: "+91 99887 76655",
        },
        items: [
          {
            product_id: "11111111-1111-1111-1111-111111111111",
            quantity: 1,
          },
        ],
      });

      // 2. Customer submits UTR
      const submitRes = await submitPaymentReference({
        order_number: orderRes.order_number,
        order_token: orderRes.order_token,
        transaction_reference: "UTR492019482012",
        payer_upi_id: "sanya@okhdfcbank",
      });

      expect(submitRes.success).toBe(true);
      expect(submitRes.status).toBe("PAYMENT_SUBMITTED");

      // 3. Verify payment record in store
      const payment = DEV_PAYMENTS_STORE.get(submitRes.payment_id);
      expect(payment).toBeDefined();
      expect(payment?.amount).toBe(499); // Bound to order total
      expect(payment?.payment_status).toBe("SUBMITTED");
      expect(payment?.transaction_reference).toBe("UTR492019482012");

      // 4. Verify order state moved to PAYMENT_SUBMITTED
      const devOrder = DEV_ORDERS_STORE.get(orderRes.order_number);
      expect(devOrder?.order.payment_status).toBe("SUBMITTED");
      expect(devOrder?.order.order_status).toBe("PAYMENT_SUBMITTED");
    });

    it("rejects duplicate UTR submission across different orders", async () => {
      // Create Order 1
      const order1 = await createGuestOrder({
        customer: { name: "User 1", email: "u1@test.com", phone: "+91 91111 22222" },
        items: [{ product_id: "11111111-1111-1111-1111-111111111111", quantity: 1 }],
      });

      // Create Order 2
      const order2 = await createGuestOrder({
        customer: { name: "User 2", email: "u2@test.com", phone: "+91 92222 33333" },
        items: [{ product_id: "11111111-1111-1111-1111-111111111111", quantity: 1 }],
      });

      // Submit UTR on Order 1
      await submitPaymentReference({
        order_number: order1.order_number,
        order_token: order1.order_token,
        transaction_reference: "DUPLICATEUTR999",
      });

      // Attempt submitting same UTR on Order 2 -> Must fail
      await expect(
        submitPaymentReference({
          order_number: order2.order_number,
          order_token: order2.order_token,
          transaction_reference: "DUPLICATEUTR999",
        })
      ).rejects.toThrow("already been submitted");
    });
  });

  describe("4. Admin Payment Verification & State Machine Transitions", () => {
    it("rejects verification request without administrative role", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: "550e8400-e29b-41d4-a716-446655440001",
          payment_id: "550e8400-e29b-41d4-a716-446655440002",
          action: "VERIFY",
        }),
      });

      const response = await verifyPaymentRoute(req);
      expect(response.status).toBe(401);
    });

    it("rejects verification if admin has non-verifying role (e.g. CONTENT_MANAGER)", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/payments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-role": "CONTENT_MANAGER",
        },
        body: JSON.stringify({
          order_id: "550e8400-e29b-41d4-a716-446655440001",
          payment_id: "550e8400-e29b-41d4-a716-446655440002",
          action: "VERIFY",
        }),
      });

      const response = await verifyPaymentRoute(req);
      expect(response.status).toBe(403);
    });

    it("authorized admin verification moves payment to VERIFIED and order to PAYMENT_VERIFIED with audit log", async () => {
      // 1. Create order & submit payment
      const orderRes = await createGuestOrder({
        customer: { name: "Ananya Sen", email: "ananya@test.com", phone: "+91 93333 44444" },
        items: [{ product_id: "11111111-1111-1111-1111-111111111111", quantity: 1 }],
      });

      const payRes = await submitPaymentReference({
        order_number: orderRes.order_number,
        order_token: orderRes.order_token,
        transaction_reference: "BANKUTR12345678",
      });

      // 2. Admin verifies payment
      const req = new NextRequest("http://localhost:3000/api/admin/payments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-role": "ORDER_MANAGER",
          "x-admin-id": "admin-mgr-007",
        },
        body: JSON.stringify({
          order_id: orderRes.order_id,
          payment_id: payRes.payment_id,
          action: "VERIFY",
        }),
      });

      const response = await verifyPaymentRoute(req);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.payment_status).toBe("VERIFIED");
      expect(json.data.order_status).toBe("PAYMENT_VERIFIED");

      // Verify payment in store
      const payment = DEV_PAYMENTS_STORE.get(payRes.payment_id);
      expect(payment?.payment_status).toBe("VERIFIED");
      expect(payment?.verified_by).toBe("admin-mgr-007");

      // Verify order in store moved to PAYMENT_VERIFIED
      const order = DEV_ORDERS_STORE.get(orderRes.order_number);
      expect(order?.order.payment_status).toBe("VERIFIED");
      expect(order?.order.order_status).toBe("PAYMENT_VERIFIED");

      // Verify Audit Log was generated
      const auditLog = getDevAuditLogs().find((l) => l.action === "PAYMENT_VERIFIED");
      expect(auditLog).toBeDefined();
      expect(auditLog?.admin_user_id).toBe("admin-mgr-007");
      const auditMetadata = auditLog?.metadata as Record<string, unknown>;
      expect(auditMetadata?.utr).toBe("BANKUTR12345678");
    });

    it("prevents duplicate verification: re-verifying an already verified payment fails (409 Conflict)", async () => {
      // 1. Create order & submit payment
      const orderRes = await createGuestOrder({
        customer: { name: "Rohan V", email: "rohan@test.com", phone: "+91 94444 55555" },
        items: [{ product_id: "11111111-1111-1111-1111-111111111111", quantity: 1 }],
      });

      const payRes = await submitPaymentReference({
        order_number: orderRes.order_number,
        order_token: orderRes.order_token,
        transaction_reference: "REVERIFYUTR1234",
      });

      // 2. First verification succeeds
      await verifyPaymentByAdmin("admin-1", {
        order_id: orderRes.order_id,
        payment_id: payRes.payment_id,
        action: "VERIFY",
      });

      // 3. Second verification attempt -> Must be rejected
      const req = new NextRequest("http://localhost:3000/api/admin/payments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-role": "SUPER_ADMIN",
          "x-admin-id": "superadmin-1",
        },
        body: JSON.stringify({
          order_id: orderRes.order_id,
          payment_id: payRes.payment_id,
          action: "VERIFY",
        }),
      });

      const response = await verifyPaymentRoute(req);
      expect(response.status).toBe(409);
      const json = await response.json();
      expect(json.error).toContain("already been verified");
    });
  });

  describe("5. Rate Limiting Defense", () => {
    it("allows requests under the rate limit threshold", () => {
      const result1 = checkRateLimit("test-ip-client", { maxRequests: 3, windowMs: 5000 });
      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(2);

      const result2 = checkRateLimit("test-ip-client", { maxRequests: 3, windowMs: 5000 });
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(1);
    });

    it("blocks requests exceeding the sliding window threshold", () => {
      const key = "spammer-ip";
      for (let i = 0; i < 5; i++) {
        checkRateLimit(key, { maxRequests: 5, windowMs: 10000 });
      }

      // 6th attempt should be blocked
      const blocked = checkRateLimit(key, { maxRequests: 5, windowMs: 10000 });
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.resetMs).toBeGreaterThan(0);
    });

    it("POST /api/payments/submit enforces rate limiting", async () => {
      const orderRes = await createGuestOrder({
        customer: { name: "Rate Limit User", email: "rl@test.com", phone: "+91 95555 66666" },
        items: [{ product_id: "11111111-1111-1111-1111-111111111111", quantity: 1 }],
      });

      // Submit 5 times (will succeed or fail on duplicate UTR, but rate limiter counts requests)
      for (let i = 0; i < 5; i++) {
        const req = new NextRequest("http://localhost:3000/api/payments/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": "198.51.100.42",
          },
          body: JSON.stringify({
            order_number: orderRes.order_number,
            order_token: orderRes.order_token,
            transaction_reference: `UTRSPAM${i}123456`,
          }),
        });
        await submitPaymentRoute(req);
      }

      // 6th request from same IP and order
      const req6 = new NextRequest("http://localhost:3000/api/payments/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "198.51.100.42",
        },
        body: JSON.stringify({
          order_number: orderRes.order_number,
          order_token: orderRes.order_token,
          transaction_reference: "UTRSPAM9999999",
        }),
      });

      const response6 = await submitPaymentRoute(req6);
      expect(response6.status).toBe(429);
      const json6 = await response6.json();
      expect(json6.error).toContain("Too many payment submission attempts");
    });
  });
});
