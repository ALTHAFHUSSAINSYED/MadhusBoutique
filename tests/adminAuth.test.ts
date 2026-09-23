// ==============================================================================
// MADHUS BOUTIQUE: SPRINT 4 ADMIN AUTH & AUTHORIZATION TEST SUITE
// Tests login, MFA/TOTP, RBAC roles, server-side authorization, lockout & audit logs
// ==============================================================================

import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import {
  clearAdminSessionsAndLockouts,
  loginAdmin,
  verifyAdminMfa,
  validateAdminSession,
} from "@/lib/server/auth/adminAuthService";
import { getDevAuditLogs, clearDevAuditLogs } from "@/lib/server/db/audit";
import { POST as loginRoute } from "@/app/api/admin/auth/login/route";
import { POST as mfaVerifyRoute } from "@/app/api/admin/auth/mfa/verify/route";
import { GET as meRoute } from "@/app/api/admin/auth/me/route";
import { POST as logoutRoute } from "@/app/api/admin/auth/logout/route";
import { GET as listAdminsRoute, POST as createAdminRoute } from "@/app/api/admin/admins/route";
import { GET as auditLogsRoute } from "@/app/api/admin/audit-logs/route";

describe("Sprint 4: Administrator Authentication & Authorization", () => {
  beforeEach(() => {
    clearAdminSessionsAndLockouts();
    clearDevAuditLogs();
  });

  describe("1. Admin Login & Credentials Verification", () => {
    it("authenticates Order Manager without MFA and issues active session", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "orders@madhusboutique.com",
          password: "OrderManager@2026!",
        }),
      });

      const response = await loginRoute(req);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.mfa_required).toBe(false);
      expect(json.data.session_token).toBeDefined();
      expect(json.data.profile.role).toBe("ORDER_MANAGER");

      // Verify audit log
      const logs = getDevAuditLogs();
      const loginLog = logs.find((l) => l.action === "ADMIN_LOGIN_SUCCESS");
      expect(loginLog).toBeDefined();
    });

    it("rejects invalid password, increments failed count and logs failure", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "orders@madhusboutique.com",
          password: "WrongPassword123!",
        }),
      });

      const response = await loginRoute(req);
      expect(response.status).toBe(401);

      const logs = getDevAuditLogs();
      const failLog = logs.find((l) => l.action === "ADMIN_LOGIN_FAILED");
      expect(failLog).toBeDefined();
    });

    it("enforces brute-force lockout defense after 5 consecutive failed attempts (429)", async () => {
      const targetEmail = "orders@madhusboutique.com";

      // 4 failed attempts
      for (let i = 0; i < 4; i++) {
        await expect(
          loginAdmin({ email: targetEmail, password: "wrong" })
        ).rejects.toThrow("INVALID_CREDENTIALS");
      }

      // 5th attempt locks account
      await expect(
        loginAdmin({ email: targetEmail, password: "wrong" })
      ).rejects.toThrow("ACCOUNT_LOCKED");

      // Even correct password is now blocked by lockout
      await expect(
        loginAdmin({ email: targetEmail, password: "OrderManager@2026!" })
      ).rejects.toThrow("ACCOUNT_LOCKED");
    });
  });

  describe("2. Two-Factor Authentication (MFA / TOTP) Workflow", () => {
    it("requires MFA challenge for Super Admin account", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "superadmin@madhusboutique.com",
          password: "SuperAdmin@2026!",
        }),
      });

      const response = await loginRoute(req);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.data.mfa_required).toBe(true);
      expect(json.data.challenge_token).toBeDefined();
      expect(json.data.session_token).toBeUndefined(); // Session not yet issued
    });

    it("rejects MFA verification with invalid TOTP code (401)", async () => {
      const loginRes = await loginAdmin({
        email: "superadmin@madhusboutique.com",
        password: "SuperAdmin@2026!",
      });

      const req = new NextRequest("http://localhost:3000/api/admin/auth/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challenge_token: loginRes.challenge_token,
          code: "999999", // Invalid code
        }),
      });

      const response = await mfaVerifyRoute(req);
      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.error).toContain("INVALID_MFA_CODE");
    });

    it("authenticates Super Admin on valid TOTP code and establishes session", async () => {
      const loginRes = await loginAdmin({
        email: "superadmin@madhusboutique.com",
        password: "SuperAdmin@2026!",
      });

      const req = new NextRequest("http://localhost:3000/api/admin/auth/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challenge_token: loginRes.challenge_token,
          code: "123456", // Valid code
        }),
      });

      const response = await mfaVerifyRoute(req);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.session_token).toBeDefined();
      expect(json.data.profile.role).toBe("SUPER_ADMIN");

      // Verify MFA success audit log
      const logs = getDevAuditLogs();
      const mfaLog = logs.find((l) => l.action === "ADMIN_MFA_SUCCESS");
      expect(mfaLog).toBeDefined();
    });
  });

  describe("3. Server-Side Session Validation & Profile Endpoint", () => {
    it("returns active admin profile and permissions when session is provided", async () => {
      const loginRes = await loginAdmin({
        email: "orders@madhusboutique.com",
        password: "OrderManager@2026!",
      });

      const req = new NextRequest("http://localhost:3000/api/admin/auth/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${loginRes.session_token}`,
        },
      });

      const response = await meRoute(req);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.role).toBe("ORDER_MANAGER");
      expect(json.data.permissions).toContain("verify:payments");
      expect(json.data.permissions).toContain("manage:orders");
      expect(json.data.permissions).not.toContain("manage:payment_qr"); // Restricted
    });

    it("rejects unauthenticated request to /api/admin/auth/me (401 Unauthorized)", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/auth/me", {
        method: "GET",
      });

      const response = await meRoute(req);
      expect(response.status).toBe(401);
    });
  });

  describe("4. Role-Based Server-Side Authorization (Never Trust Frontend)", () => {
    it("allows Super Admin to view and create admin accounts", async () => {
      const superLogin = await loginAdmin({
        email: "superadmin@madhusboutique.com",
        password: "SuperAdmin@2026!",
      });
      const mfaRes = await verifyAdminMfa({
        challenge_token: superLogin.challenge_token!,
        code: "123456",
      });

      // 1. Super admin can list admins
      const listReq = new NextRequest("http://localhost:3000/api/admin/admins", {
        method: "GET",
        headers: { Authorization: `Bearer ${mfaRes.session_token}` },
      });
      const listResponse = await listAdminsRoute(listReq);
      expect(listResponse.status).toBe(200);

      // 2. Super admin creates new admin
      const createReq = new NextRequest("http://localhost:3000/api/admin/admins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mfaRes.session_token}`,
        },
        body: JSON.stringify({
          email: "newstaff@madhusboutique.com",
          password: "StaffPassword@2026!",
          full_name: "Staff Member",
          role: "ORDER_MANAGER",
          mfa_enabled: false,
        }),
      });
      const createResponse = await createAdminRoute(createReq);
      expect(createResponse.status).toBe(200);
      const createJson = await createResponse.json();
      expect(createJson.success).toBe(true);
      expect(createJson.data.role).toBe("ORDER_MANAGER");
    });

    it("blocks Order Manager from accessing admin management (403 Forbidden)", async () => {
      const orderLogin = await loginAdmin({
        email: "orders@madhusboutique.com",
        password: "OrderManager@2026!",
      });

      const req = new NextRequest("http://localhost:3000/api/admin/admins", {
        method: "GET",
        headers: { Authorization: `Bearer ${orderLogin.session_token}` },
      });

      const response = await listAdminsRoute(req);
      expect(response.status).toBe(403);
      const json = await response.json();
      expect(json.error).toContain("Forbidden");
      expect(json.error).toContain("manage:admins");
    });

    it("blocks Content Manager from accessing audit logs (403 Forbidden)", async () => {
      const contentLogin = await loginAdmin({
        email: "content@madhusboutique.com",
        password: "ContentManager@2026!",
      });

      const req = new NextRequest("http://localhost:3000/api/admin/audit-logs", {
        method: "GET",
        headers: { Authorization: `Bearer ${contentLogin.session_token}` },
      });

      const response = await auditLogsRoute(req);
      expect(response.status).toBe(403);
      const json = await response.json();
      expect(json.error).toContain("Forbidden");
      expect(json.error).toContain("view:audit_logs");
    });

    it("allows Super Admin to view immutable audit logs", async () => {
      const superLogin = await loginAdmin({
        email: "superadmin@madhusboutique.com",
        password: "SuperAdmin@2026!",
      });
      const mfaRes = await verifyAdminMfa({
        challenge_token: superLogin.challenge_token!,
        code: "123456",
      });

      const req = new NextRequest("http://localhost:3000/api/admin/audit-logs", {
        method: "GET",
        headers: { Authorization: `Bearer ${mfaRes.session_token}` },
      });

      const response = await auditLogsRoute(req);
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
    });
  });

  describe("5. Logout & Session Revocation", () => {
    it("revokes session on logout and denies subsequent access", async () => {
      const loginRes = await loginAdmin({
        email: "orders@madhusboutique.com",
        password: "OrderManager@2026!",
      });

      const sessionToken = loginRes.session_token!;

      // 1. Session is valid before logout
      const sessionBefore = await validateAdminSession(sessionToken);
      expect(sessionBefore).not.toBeNull();

      // 2. Perform logout
      const logoutReq = new NextRequest("http://localhost:3000/api/admin/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${sessionToken}` },
      });

      const logoutResponse = await logoutRoute(logoutReq);
      expect(logoutResponse.status).toBe(200);

      // 3. Session is now invalid
      const sessionAfter = await validateAdminSession(sessionToken);
      expect(sessionAfter).toBeNull();

      // 4. API request with revoked session fails
      const meReq = new NextRequest("http://localhost:3000/api/admin/auth/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      const meResponse = await meRoute(meReq);
      expect(meResponse.status).toBe(401);
    });
  });
});
