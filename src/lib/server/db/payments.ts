// ==============================================================================
// MADHUS BOUTIQUE: SERVER-SIDE PAYMENT & VERIFICATION MODULE
// Enforces duplicate UTR prevention, RBAC verification & automated audit logging
// ==============================================================================

import { createServerServiceClient } from "./client";
import { SubmitPaymentInput, VerifyPaymentInput } from "@/lib/validations/schemas";
import { logAuditAction } from "./audit";
import { PaymentRow } from "@/../types/database";
import { DEV_ORDERS_STORE } from "./orders";

const isOfflineOrTest =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-project");

export const DEV_PAYMENTS_STORE = new Map<string, PaymentRow>();

export function getDevPayments(): PaymentRow[] {
  return Array.from(DEV_PAYMENTS_STORE.values());
}

export function clearDevPayments(): void {
  DEV_PAYMENTS_STORE.clear();
}

/**
 * Customer submits 12-digit UPI transaction reference (UTR)
 * Zero-trust: amount is strictly bound to order.total_amount from the server.
 */
export async function submitPaymentReference(input: SubmitPaymentInput) {
  // 1. Verify order exists and caller owns the valid order_token
  let orderId = "";
  let orderTotal = 0;

  if (isOfflineOrTest) {
    const devRecord = DEV_ORDERS_STORE.get(input.order_number);
    if (!devRecord || devRecord.order.order_token !== input.order_token) {
      throw new Error("Order not found or invalid security token.");
    }
    orderId = devRecord.order.id;
    orderTotal = devRecord.order.total_amount;

    // Check duplicate UTR across in-memory payments
    const existing = Array.from(DEV_PAYMENTS_STORE.values()).find(
      (p) => p.transaction_reference === input.transaction_reference
    );
    if (existing) {
      throw new Error(
        "This transaction reference has already been submitted. Please check your bank receipt."
      );
    }

    const paymentId = crypto.randomUUID();
    const paymentRecord: PaymentRow = {
      id: paymentId,
      order_id: orderId,
      payment_method: "UPI_QR",
      transaction_reference: input.transaction_reference,
      amount: orderTotal,
      payment_status: "SUBMITTED",
      payer_upi_id: input.payer_upi_id || null,
      verified_by: null,
      verified_at: null,
      rejection_reason: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    DEV_PAYMENTS_STORE.set(paymentId, paymentRecord);

    // Update order status
    devRecord.order.payment_status = "SUBMITTED";
    devRecord.order.order_status = "PAYMENT_SUBMITTED";
    devRecord.order.updated_at = new Date().toISOString();

    return {
      success: true,
      payment_id: paymentId,
      order_number: input.order_number,
      status: "PAYMENT_SUBMITTED",
    };
  }

  // Live Supabase Execution
  const supabase = createServerServiceClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, total_amount, payment_status, order_status")
    .eq("order_number", input.order_number)
    .eq("order_token", input.order_token)
    .single();

  if (orderError || !order) {
    throw new Error("Order not found or invalid security token.");
  }

  // Enforce duplicate UTR prevention across all payments
  const { data: existingPayment } = await supabase
    .from("payments")
    .select("id, order_id")
    .eq("transaction_reference", input.transaction_reference)
    .maybeSingle();

  if (existingPayment) {
    throw new Error(
      "This transaction reference has already been submitted. Please check your bank receipt."
    );
  }

  // Insert payment record with amount strictly from order.total_amount
  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .insert({
      order_id: order.id,
      payment_method: "UPI_QR",
      transaction_reference: input.transaction_reference,
      amount: order.total_amount,
      payment_status: "SUBMITTED",
      payer_upi_id: input.payer_upi_id || null,
    })
    .select("id")
    .single();

  if (paymentError || !payment) {
    throw new Error(`Failed to record payment reference: ${paymentError?.message || "Error"}`);
  }

  // Update order status
  await supabase
    .from("orders")
    .update({
      payment_status: "SUBMITTED",
      order_status: "PAYMENT_SUBMITTED",
    })
    .eq("id", order.id);

  return {
    success: true,
    payment_id: payment.id,
    order_number: input.order_number,
    status: "PAYMENT_SUBMITTED",
  };
}

/**
 * Admin verifies or rejects a customer payment (Protected Server Action)
 * Prevents duplicate verification and creates an immutable audit trail.
 */
export async function verifyPaymentByAdmin(
  adminAuthUserId: string,
  input: VerifyPaymentInput,
  clientIp?: string,
  userAgent?: string
) {
  const isVerifying = input.action === "VERIFY";
  const newPaymentStatus = isVerifying ? "VERIFIED" : "REJECTED";
  const newOrderStatus = isVerifying ? "PAYMENT_VERIFIED" : "PENDING_PAYMENT";

  if (isOfflineOrTest) {
    const payment = DEV_PAYMENTS_STORE.get(input.payment_id);
    if (!payment) {
      throw new Error("Payment record not found.");
    }

    // Prevent duplicate verification
    if (payment.payment_status === "VERIFIED") {
      throw new Error("Payment has already been verified.");
    }

    // Update payment record
    payment.payment_status = newPaymentStatus;
    payment.verified_by = adminAuthUserId;
    payment.verified_at = new Date().toISOString();
    payment.rejection_reason = isVerifying ? null : input.rejection_reason || "Invalid reference";
    payment.updated_at = new Date().toISOString();

    // Update associated order in memory store
    for (const record of DEV_ORDERS_STORE.values()) {
      if (record.order.id === payment.order_id || record.order.id === input.order_id) {
        record.order.payment_status = newPaymentStatus;
        record.order.order_status = newOrderStatus;
        record.order.updated_at = new Date().toISOString();
        break;
      }
    }

    // Append Audit Log Entry
    await logAuditAction(
      adminAuthUserId,
      isVerifying ? "PAYMENT_VERIFIED" : "PAYMENT_REJECTED",
      "payments",
      input.payment_id,
      {
        order_id: payment.order_id,
        amount: payment.amount,
        utr: payment.transaction_reference,
        action: input.action,
        rejection_reason: input.rejection_reason,
      },
      clientIp,
      userAgent
    );

    return {
      success: true,
      action: input.action,
      payment_id: input.payment_id,
      order_id: payment.order_id,
      payment_status: newPaymentStatus,
      order_status: newOrderStatus,
    };
  }

  // Live Supabase Execution
  const supabase = createServerServiceClient();

  // Fetch payment and order
  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select("id, order_id, amount, transaction_reference, payment_status")
    .eq("id", input.payment_id)
    .single();

  if (paymentError || !payment) {
    throw new Error("Payment record not found.");
  }

  // Prevent duplicate verification
  if (payment.payment_status === "VERIFIED") {
    throw new Error("Payment has already been verified.");
  }

  // Update payment status
  await supabase
    .from("payments")
    .update({
      payment_status: newPaymentStatus,
      verified_by: adminAuthUserId,
      verified_at: new Date().toISOString(),
      rejection_reason: isVerifying ? null : input.rejection_reason || "Invalid reference",
    })
    .eq("id", input.payment_id);

  // Update order status: Order only moves to PAYMENT_VERIFIED upon verified payment
  await supabase
    .from("orders")
    .update({
      payment_status: newPaymentStatus,
      order_status: newOrderStatus,
    })
    .eq("id", payment.order_id);

  // Append Audit Log Entry
  await logAuditAction(
    adminAuthUserId,
    isVerifying ? "PAYMENT_VERIFIED" : "PAYMENT_REJECTED",
    "payments",
    input.payment_id,
    {
      order_id: payment.order_id,
      amount: payment.amount,
      utr: payment.transaction_reference,
      action: input.action,
      rejection_reason: input.rejection_reason,
    },
    clientIp,
    userAgent
  );

  return {
    success: true,
    action: input.action,
    payment_id: input.payment_id,
    order_id: payment.order_id,
    payment_status: newPaymentStatus,
    order_status: newOrderStatus,
  };
}
