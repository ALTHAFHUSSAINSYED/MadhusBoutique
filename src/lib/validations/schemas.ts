// ==============================================================================
// MADHUS BOUTIQUE: ZOD REQUEST VALIDATION SCHEMAS
// Strict server-side data validation to prevent tampering and malicious inputs
// ==============================================================================

import { z } from "zod";

// 1. Phone number validation (Indian 10-digit mobile or international format)
export const phoneRegex = /^(\+91[\-\s]?)?[6-9]\d{9}$/;

// 2. Order Number Format (MB-YYYYMMDD-XXXXX)
export const orderNumberRegex = /^MB-\d{8}-\d{5}$/;

// 3. UUID regex (standard 36-character hyphenated UUID)
export const uuidSchema = z
  .string()
  .trim()
  .regex(
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    "Invalid UUID format"
  );

// 4. Customer Profile Schema
export const customerInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address"),
  phone: z
    .string()
    .trim()
    .refine((val) => val.replace(/[\s\-]/g, "").length >= 10, {
      message: "Phone number must be at least 10 digits",
    }),
  notes: z.string().trim().max(500, "Notes cannot exceed 500 characters").optional(),
});

// 5. Cart Item Input Schema (Client only provides ID & Quantity)
// CRITICAL: Product prices and names are NEVER accepted from client
export const cartItemInputSchema = z.object({
  product_id: uuidSchema,
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .max(25, "Maximum 25 units per digital item"),
});

// 6. Create Order Request Schema
export const createOrderInputSchema = z.object({
  customer: customerInputSchema,
  items: z
    .array(cartItemInputSchema)
    .min(1, "Your cart must contain at least one design"),
});

// 7. UPI Payment Reference Submission Schema
export const submitPaymentInputSchema = z.object({
  order_number: z
    .string()
    .trim()
    .toUpperCase()
    .regex(orderNumberRegex, "Invalid order number format"),
  order_token: uuidSchema,
  transaction_reference: z
    .string()
    .trim()
    .min(8, "Transaction reference / UTR must be at least 8 characters")
    .max(30, "Transaction reference cannot exceed 30 characters")
    .regex(/^[a-zA-Z0-9]+$/, "Transaction reference must be alphanumeric"),
  payer_upi_id: z.string().trim().max(100).optional(),
});

// 8. Track Order Request Schema
export const trackOrderInputSchema = z.object({
  order_number: z
    .string()
    .trim()
    .toUpperCase()
    .regex(orderNumberRegex, "Invalid order number format"),
  verification: z
    .string()
    .trim()
    .min(4, "Verification phone or email is required"),
});

// 9. Admin Payment Verification Schema
export const verifyPaymentInputSchema = z.object({
  order_id: uuidSchema,
  payment_id: uuidSchema,
  action: z.enum(["VERIFY", "REJECT"]),
  rejection_reason: z.string().trim().max(255).optional(),
});

// 10. Admin Payment Settings Modification Schema
export const updatePaymentSettingsInputSchema = z.object({
  upi_id: z
    .string()
    .trim()
    .min(3, "UPI ID too short")
    .max(100, "UPI ID too long")
    .includes("@", { message: "Invalid UPI ID (must contain @)" }),
  merchant_name: z
    .string()
    .trim()
    .min(2, "Merchant name must be at least 2 characters")
    .max(150, "Merchant name cannot exceed 150 characters"),
  qr_image_s3_key: z.string().trim().optional(),
});

// 11. Admin Login Schema
export const adminLoginInputSchema = z.object({
  email: z.string().trim().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// 12. Admin MFA TOTP Verification Schema
export const adminMfaVerifyInputSchema = z.object({
  challenge_token: z.string().trim().min(10, "Invalid MFA challenge token"),
  code: z.string().trim().regex(/^\d{6}$/, "MFA code must be exactly 6 digits"),
});

// 13. Admin Creation Schema (SUPER_ADMIN only)
export const adminCreateInputSchema = z.object({
  email: z.string().trim().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  full_name: z.string().trim().min(2, "Full name must be at least 2 characters").max(100),
  role: z.enum(["SUPER_ADMIN", "ORDER_MANAGER", "CONTENT_MANAGER"]),
  mfa_enabled: z.boolean().default(false),
});

// 14. Admin Role Update Schema (SUPER_ADMIN only)
export const adminUpdateRoleInputSchema = z.object({
  role: z.enum(["SUPER_ADMIN", "ORDER_MANAGER", "CONTENT_MANAGER"]).optional(),
  mfa_enabled: z.boolean().optional(),
});

// Infer TypeScript types from Zod schemas
export type CustomerInput = z.infer<typeof customerInputSchema>;
export type CartItemInput = z.infer<typeof cartItemInputSchema>;
export type CreateOrderInput = z.infer<typeof createOrderInputSchema>;
export type SubmitPaymentInput = z.infer<typeof submitPaymentInputSchema>;
export type TrackOrderInput = z.infer<typeof trackOrderInputSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentInputSchema>;
export type UpdatePaymentSettingsInput = z.infer<typeof updatePaymentSettingsInputSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginInputSchema>;
export type AdminMfaVerifyInput = z.infer<typeof adminMfaVerifyInputSchema>;
export type AdminCreateInput = z.infer<typeof adminCreateInputSchema>;
export type AdminUpdateRoleInput = z.infer<typeof adminUpdateRoleInputSchema>;

