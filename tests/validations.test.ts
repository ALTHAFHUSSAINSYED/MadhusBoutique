import { describe, it, expect } from "vitest";
import {
  customerInputSchema,
  cartItemInputSchema,
  createOrderInputSchema,
  submitPaymentInputSchema,
  trackOrderInputSchema,
  verifyPaymentInputSchema,
} from "@/lib/validations/schemas";

describe("Sprint 2: Zod Validation Schemas", () => {
  it("accepts valid customer profile data and rejects invalid emails/short phones", () => {
    const valid = {
      name: "Priya Sharma",
      email: "priya@example.com",
      phone: "+91 98765 43210",
      notes: "Please test with Tajima DST",
    };
    expect(customerInputSchema.safeParse(valid).success).toBe(true);

    const invalidEmail = { ...valid, email: "not-an-email" };
    expect(customerInputSchema.safeParse(invalidEmail).success).toBe(false);

    const shortPhone = { ...valid, phone: "12345" };
    expect(customerInputSchema.safeParse(shortPhone).success).toBe(false);

    const emptyName = { ...valid, name: "A" };
    expect(customerInputSchema.safeParse(emptyName).success).toBe(false);
  });

  it("enforces valid cart items (valid UUID and positive integer quantity)", () => {
    const validItem = {
      product_id: "11111111-1111-1111-1111-111111111111",
      quantity: 2,
    };
    expect(cartItemInputSchema.safeParse(validItem).success).toBe(true);

    const zeroQuantity = { ...validItem, quantity: 0 };
    expect(cartItemInputSchema.safeParse(zeroQuantity).success).toBe(false);

    const negativeQuantity = { ...validItem, quantity: -1 };
    expect(cartItemInputSchema.safeParse(negativeQuantity).success).toBe(false);

    const nonUuid = { ...validItem, product_id: "not-a-uuid" };
    expect(cartItemInputSchema.safeParse(nonUuid).success).toBe(false);
  });

  it("enforces order creation constraints (at least 1 item)", () => {
    const emptyOrder = {
      customer: {
        name: "Priya Sharma",
        email: "priya@example.com",
        phone: "+91 98765 43210",
      },
      items: [],
    };
    expect(createOrderInputSchema.safeParse(emptyOrder).success).toBe(false);
  });

  it("strictly validates payment reference (UTR) submission format", () => {
    const validPayment = {
      order_number: "MB-20260923-12345",
      order_token: "11111111-1111-1111-1111-111111111111",
      transaction_reference: "426819284710",
    };
    expect(submitPaymentInputSchema.safeParse(validPayment).success).toBe(true);

    // Malformed order number
    const badOrderNum = { ...validPayment, order_number: "INVALID-123" };
    expect(submitPaymentInputSchema.safeParse(badOrderNum).success).toBe(false);

    // Short UTR (< 8 chars)
    const shortUtr = { ...validPayment, transaction_reference: "123" };
    expect(submitPaymentInputSchema.safeParse(shortUtr).success).toBe(false);

    // Non-alphanumeric UTR
    const symbolsUtr = { ...validPayment, transaction_reference: "UTR@#$12345" };
    expect(submitPaymentInputSchema.safeParse(symbolsUtr).success).toBe(false);
  });

  it("validates admin payment verification payload", () => {
    const validVerify = {
      order_id: "11111111-1111-1111-1111-111111111111",
      payment_id: "22222222-2222-2222-2222-222222222222",
      action: "VERIFY" as const,
    };
    expect(verifyPaymentInputSchema.safeParse(validVerify).success).toBe(true);

    const invalidAction = { ...validVerify, action: "ARBITRARY_ACTION" };
    expect(verifyPaymentInputSchema.safeParse(invalidAction).success).toBe(false);
  });

  it("validates order tracking lookup payload", () => {
    const validTracking = {
      order_number: "MB-20260923-12345",
      verification: "priya@example.com",
    };
    expect(trackOrderInputSchema.safeParse(validTracking).success).toBe(true);

    const invalidTracking = {
      order_number: "INVALID_NUMBER",
      verification: "x",
    };
    expect(trackOrderInputSchema.safeParse(invalidTracking).success).toBe(false);
  });
});
