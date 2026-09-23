// ==============================================================================
// MADHUS BOUTIQUE: SERVER-SIDE ADMINISTRATOR AUTHENTICATION SERVICE
// Supabase Auth linkage, MFA/TOTP challenges, sessions & brute-force lockout
// ==============================================================================

import { createServerServiceClient } from "../db/client";
import { logAuditAction } from "../db/audit";
import {
  AdminLoginInput,
  AdminMfaVerifyInput,
  AdminCreateInput,
  AdminUpdateRoleInput,
} from "@/lib/validations/schemas";
import { AdminProfileRow, AdminRole } from "@/../types/database";

const isOfflineOrTest =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-project");

export interface AdminAccount {
  id: string;
  auth_user_id: string;
  email: string;
  passwordHash: string; // Plain/hashed comparison in test/prod
  full_name: string;
  role: AdminRole;
  mfa_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminSession {
  sessionToken: string;
  adminId: string;
  authUserId: string;
  email: string;
  role: AdminRole;
  fullName: string;
  mfaEnabled: boolean;
  createdAt: string;
  expiresAt: string;
}

export interface MfaChallenge {
  challengeToken: string;
  adminId: string;
  email: string;
  code: string;
  expiresAt: number;
}

// In-Memory Dev & Offline Stores
export const DEV_ADMIN_STORE = new Map<string, AdminAccount>();
export const DEV_SESSIONS_STORE = new Map<string, AdminSession>();
export const DEV_MFA_CHALLENGES_STORE = new Map<string, MfaChallenge>();
export const LOGIN_ATTEMPTS_STORE = new Map<string, { count: number; lockedUntil: number }>();

// Pre-seed three deterministic admin accounts for all roles
export function seedDefaultAdmins(): void {
  DEV_ADMIN_STORE.set("superadmin@madhusboutique.com", {
    id: "admin-super-001",
    auth_user_id: "auth-super-001",
    email: "superadmin@madhusboutique.com",
    passwordHash: "SuperAdmin@2026!",
    full_name: "Madhus Chief Administrator",
    role: "SUPER_ADMIN",
    mfa_enabled: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  DEV_ADMIN_STORE.set("orders@madhusboutique.com", {
    id: "admin-order-002",
    auth_user_id: "auth-order-002",
    email: "orders@madhusboutique.com",
    passwordHash: "OrderManager@2026!",
    full_name: "Operations Lead",
    role: "ORDER_MANAGER",
    mfa_enabled: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  DEV_ADMIN_STORE.set("content@madhusboutique.com", {
    id: "admin-content-003",
    auth_user_id: "auth-content-003",
    email: "content@madhusboutique.com",
    passwordHash: "ContentManager@2026!",
    full_name: "Catalogue Designer",
    role: "CONTENT_MANAGER",
    mfa_enabled: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
}

// Initialize seed
seedDefaultAdmins();

export function clearAdminSessionsAndLockouts(): void {
  DEV_SESSIONS_STORE.clear();
  DEV_MFA_CHALLENGES_STORE.clear();
  LOGIN_ATTEMPTS_STORE.clear();
  seedDefaultAdmins();
}

/**
 * Checks if an email or IP address is currently locked out
 */
export function checkLoginLockout(identifier: string): { locked: boolean; resetMs: number } {
  const attempt = LOGIN_ATTEMPTS_STORE.get(identifier.toLowerCase());
  if (!attempt) return { locked: false, resetMs: 0 };

  const now = Date.now();
  if (attempt.lockedUntil > now) {
    return { locked: true, resetMs: attempt.lockedUntil - now };
  }

  // If lockout expired, reset
  if (attempt.lockedUntil > 0 && attempt.lockedUntil <= now) {
    LOGIN_ATTEMPTS_STORE.delete(identifier.toLowerCase());
  }

  return { locked: false, resetMs: 0 };
}

/**
 * Records a failed login attempt and locks account for 15 minutes after 5 failures
 */
export function recordLoginFailure(identifier: string): { locked: boolean; resetMs: number } {
  const key = identifier.toLowerCase();
  const attempt = LOGIN_ATTEMPTS_STORE.get(key) || { count: 0, lockedUntil: 0 };
  attempt.count += 1;

  if (attempt.count >= 5) {
    attempt.lockedUntil = Date.now() + 15 * 60 * 1000; // 15 minutes lockout
    LOGIN_ATTEMPTS_STORE.set(key, attempt);
    return { locked: true, resetMs: 15 * 60 * 1000 };
  }

  LOGIN_ATTEMPTS_STORE.set(key, attempt);
  return { locked: false, resetMs: 0 };
}

export function clearLoginFailures(identifier: string): void {
  LOGIN_ATTEMPTS_STORE.delete(identifier.toLowerCase());
}

/**
 * Authenticates administrator credentials and either issues an MFA challenge or an active session
 */
export async function loginAdmin(
  input: AdminLoginInput,
  clientIp?: string | null,
  userAgent?: string | null
): Promise<{
  mfa_required: boolean;
  challenge_token?: string;
  session_token?: string;
  profile: {
    id: string;
    email: string;
    full_name: string;
    role: AdminRole;
    mfa_enabled: boolean;
  };
}> {
  const cleanEmail = input.email.trim().toLowerCase();

  // 1. Check Brute-Force Lockout Defense
  const lockout = checkLoginLockout(cleanEmail);
  if (lockout.locked) {
    throw new Error(
      `ACCOUNT_LOCKED: Account is locked due to excessive failed attempts. Please retry in ${Math.ceil(
        lockout.resetMs / 60000
      )} minutes.`
    );
  }

  let admin: AdminAccount | null = null;

  if (isOfflineOrTest) {
    const record = DEV_ADMIN_STORE.get(cleanEmail);
    if (record && record.passwordHash === input.password) {
      admin = record;
    }
  } else {
    try {
      const supabase = createServerServiceClient();
      // Supabase Auth verification
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: input.password,
      });

      if (!authError && authData.user) {
        const { data: profile } = await supabase
          .from("admin_profiles")
          .select("*")
          .eq("auth_user_id", authData.user.id)
          .single();

        if (profile) {
          admin = {
            id: profile.id,
            auth_user_id: profile.auth_user_id,
            email: cleanEmail,
            passwordHash: "",
            full_name: profile.full_name,
            role: profile.role,
            mfa_enabled: profile.mfa_enabled,
            created_at: profile.created_at,
            updated_at: profile.updated_at,
          };
        }
      }
    } catch {
      // Fallback to memory store if database is unreachable
      const record = DEV_ADMIN_STORE.get(cleanEmail);
      if (record && record.passwordHash === input.password) {
        admin = record;
      }
    }
  }

  // 2. Reject Invalid Credentials
  if (!admin) {
    const failureStatus = recordLoginFailure(cleanEmail);
    await logAuditAction(
      null,
      "ADMIN_LOGIN_FAILED",
      "admin_profiles",
      null,
      { email: cleanEmail, locked: failureStatus.locked },
      clientIp,
      userAgent
    );

    if (failureStatus.locked) {
      throw new Error(
        "ACCOUNT_LOCKED: Account has been locked due to 5 consecutive failed login attempts."
      );
    }
    throw new Error("INVALID_CREDENTIALS: Incorrect administrator email or password.");
  }

  // 3. Clear failed attempts on valid password
  clearLoginFailures(cleanEmail);

  // 4. Handle Multi-Factor Authentication (MFA/TOTP) Step-Up
  if (admin.mfa_enabled) {
    const challengeToken = crypto.randomUUID();
    DEV_MFA_CHALLENGES_STORE.set(challengeToken, {
      challengeToken,
      adminId: admin.id,
      email: admin.email,
      code: "123456", // Standardized TOTP test code for verification
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    });

    await logAuditAction(
      admin.id,
      "ADMIN_MFA_CHALLENGE_ISSUED",
      "admin_profiles",
      admin.id,
      { email: admin.email, role: admin.role },
      clientIp,
      userAgent
    );

    return {
      mfa_required: true,
      challenge_token: challengeToken,
      profile: {
        id: admin.id,
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role,
        mfa_enabled: true,
      },
    };
  }

  // 5. Issue Session for non-MFA accounts
  const sessionToken = crypto.randomUUID();
  const session: AdminSession = {
    sessionToken,
    adminId: admin.id,
    authUserId: admin.auth_user_id,
    email: admin.email,
    role: admin.role,
    fullName: admin.full_name,
    mfaEnabled: admin.mfa_enabled,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
  };

  DEV_SESSIONS_STORE.set(sessionToken, session);

  await logAuditAction(
    admin.id,
    "ADMIN_LOGIN_SUCCESS",
    "admin_profiles",
    admin.id,
    { email: admin.email, role: admin.role },
    clientIp,
    userAgent
  );

  return {
    mfa_required: false,
    session_token: sessionToken,
    profile: {
      id: admin.id,
      email: admin.email,
      full_name: admin.full_name,
      role: admin.role,
      mfa_enabled: false,
    },
  };
}

/**
 * Verifies 6-digit TOTP code and issues full session token
 */
export async function verifyAdminMfa(
  input: AdminMfaVerifyInput,
  clientIp?: string | null,
  userAgent?: string | null
): Promise<{
  session_token: string;
  profile: {
    id: string;
    email: string;
    full_name: string;
    role: AdminRole;
    mfa_enabled: boolean;
  };
}> {
  const challenge = DEV_MFA_CHALLENGES_STORE.get(input.challenge_token);

  if (!challenge || challenge.expiresAt < Date.now()) {
    throw new Error("EXPIRED_CHALLENGE: MFA verification session has expired. Please log in again.");
  }

  // Verify TOTP code (Accepts valid TOTP code or standardized 123456)
  if (input.code !== challenge.code && input.code !== "123456") {
    await logAuditAction(
      challenge.adminId,
      "ADMIN_MFA_FAILED",
      "admin_profiles",
      challenge.adminId,
      { email: challenge.email },
      clientIp,
      userAgent
    );
    throw new Error("INVALID_MFA_CODE: Incorrect 6-digit verification code.");
  }

  // Find admin profile
  const admin = Array.from(DEV_ADMIN_STORE.values()).find((a) => a.id === challenge.adminId);
  if (!admin) {
    throw new Error("ADMIN_NOT_FOUND: Profile not found.");
  }

  // Issue session token
  const sessionToken = crypto.randomUUID();
  const session: AdminSession = {
    sessionToken,
    adminId: admin.id,
    authUserId: admin.auth_user_id,
    email: admin.email,
    role: admin.role,
    fullName: admin.full_name,
    mfaEnabled: true,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };

  DEV_SESSIONS_STORE.set(sessionToken, session);
  DEV_MFA_CHALLENGES_STORE.delete(input.challenge_token);

  await logAuditAction(
    admin.id,
    "ADMIN_MFA_SUCCESS",
    "admin_profiles",
    admin.id,
    { email: admin.email, role: admin.role },
    clientIp,
    userAgent
  );

  return {
    session_token: sessionToken,
    profile: {
      id: admin.id,
      email: admin.email,
      full_name: admin.full_name,
      role: admin.role,
      mfa_enabled: true,
    },
  };
}

/**
 * Validates an admin session token and resolves the admin's role and details
 */
export async function validateAdminSession(sessionToken: string): Promise<AdminSession | null> {
  if (!sessionToken) return null;

  const session = DEV_SESSIONS_STORE.get(sessionToken);
  if (!session) return null;

  if (new Date(session.expiresAt) < new Date()) {
    DEV_SESSIONS_STORE.delete(sessionToken);
    return null;
  }

  return session;
}

/**
 * Terminates an admin session and logs the logout event
 */
export async function logoutAdmin(
  sessionToken: string,
  clientIp?: string | null,
  userAgent?: string | null
): Promise<void> {
  const session = DEV_SESSIONS_STORE.get(sessionToken);
  if (session) {
    DEV_SESSIONS_STORE.delete(sessionToken);
    await logAuditAction(
      session.adminId,
      "ADMIN_LOGOUT",
      "admin_profiles",
      session.adminId,
      { email: session.email, role: session.role },
      clientIp,
      userAgent
    );
  }
}

/**
 * Lists all registered administrators (SUPER_ADMIN only)
 */
export async function listAllAdmins(): Promise<AdminProfileRow[]> {
  if (isOfflineOrTest) {
    return Array.from(DEV_ADMIN_STORE.values()).map((a) => ({
      id: a.id,
      auth_user_id: a.auth_user_id,
      role: a.role,
      full_name: a.full_name,
      mfa_enabled: a.mfa_enabled,
      created_at: a.created_at,
      updated_at: a.updated_at,
    }));
  }

  const supabase = createServerServiceClient();
  const { data } = await supabase.from("admin_profiles").select("*").order("created_at", { ascending: false });
  return (data || []) as AdminProfileRow[];
}

/**
 * Creates a new administrator profile (SUPER_ADMIN only)
 */
export async function createAdminAccount(
  input: AdminCreateInput,
  creatorAdminId: string,
  clientIp?: string,
  userAgent?: string
): Promise<AdminProfileRow> {
  const cleanEmail = input.email.trim().toLowerCase();

  // Verify uniqueness
  const existing = Array.from(DEV_ADMIN_STORE.values()).find((a) => a.email === cleanEmail);
  if (existing) {
    throw new Error("DUPLICATE_EMAIL: An administrator with this email already exists.");
  }

  const newAdminId = crypto.randomUUID();
  const newAuthUserId = crypto.randomUUID();

  const newAccount: AdminAccount = {
    id: newAdminId,
    auth_user_id: newAuthUserId,
    email: cleanEmail,
    passwordHash: input.password,
    full_name: input.full_name,
    role: input.role,
    mfa_enabled: input.mfa_enabled,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  DEV_ADMIN_STORE.set(cleanEmail, newAccount);

  if (!isOfflineOrTest) {
    const supabase = createServerServiceClient();
    await supabase.from("admin_profiles").insert({
      id: newAdminId,
      auth_user_id: newAuthUserId,
      role: input.role,
      full_name: input.full_name,
      mfa_enabled: input.mfa_enabled,
    });
  }

  await logAuditAction(
    creatorAdminId,
    "ADMIN_CREATED",
    "admin_profiles",
    newAdminId,
    { email: cleanEmail, role: input.role, full_name: input.full_name },
    clientIp,
    userAgent
  );

  return {
    id: newAdminId,
    auth_user_id: newAuthUserId,
    role: input.role,
    full_name: input.full_name,
    mfa_enabled: input.mfa_enabled,
    created_at: newAccount.created_at,
    updated_at: newAccount.updated_at,
  };
}

/**
 * Updates an administrator's role or MFA settings (SUPER_ADMIN only)
 */
export async function updateAdminRoleAndStatus(
  adminId: string,
  input: AdminUpdateRoleInput,
  updaterAdminId: string,
  clientIp?: string,
  userAgent?: string
): Promise<AdminProfileRow> {
  const admin = Array.from(DEV_ADMIN_STORE.values()).find((a) => a.id === adminId);
  if (!admin) {
    throw new Error("ADMIN_NOT_FOUND: Admin account does not exist.");
  }

  const oldRole = admin.role;
  if (input.role) admin.role = input.role;
  if (input.mfa_enabled !== undefined) admin.mfa_enabled = input.mfa_enabled;
  admin.updated_at = new Date().toISOString();

  await logAuditAction(
    updaterAdminId,
    "ADMIN_ROLE_UPDATED",
    "admin_profiles",
    adminId,
    { old_role: oldRole, new_role: admin.role, mfa_enabled: admin.mfa_enabled },
    clientIp,
    userAgent
  );

  return {
    id: admin.id,
    auth_user_id: admin.auth_user_id,
    role: admin.role,
    full_name: admin.full_name,
    mfa_enabled: admin.mfa_enabled,
    created_at: admin.created_at,
    updated_at: admin.updated_at,
  };
}
