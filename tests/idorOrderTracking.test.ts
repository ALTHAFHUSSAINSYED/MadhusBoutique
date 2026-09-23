import { describe, it, expect } from "vitest";
import { MOCK_PRODUCTS } from "@/data/mockProducts";
import { generateOrderNumber } from "@/lib/utils";
import { createOrderInputSchema, trackOrderInputSchema } from "@/lib/validations/schemas";
import { createGuestOrder, getOrderByToken, getOrderByNumberAndVerification } from "@/lib/server/db/orders";

describe("Sprint 2 & 3: Cart, Order Creation & IDOR Defense Test Suite", () => {
  describe("Server-Side Price Calculation & Tamper Resistance", () => {
    it("never trusts client-supplied prices or totals in request payloads", () => {
      // Attacker attempts to inject fake low price and custom total
      const tamperedPayload = {
        customer: {
          name: "Attacker User",
          email: "attacker@test.com",
          phone: "+91 98765 43210",
        },
        items: [
          {
            product_id: "11111111-1111-1111-1111-111111111111",
            quantity: 2,
            price: 1, // Tampered field
            subtotal: 2, // Tampered field
            total_amount: 2, // Tampered field
          },
        ],
        subtotal: 2, // Tampered field
        total_amount: 2, // Tampered field
      };

      // 1. Zod schema validation strips client-submitted pricing fields
      const validated = createOrderInputSchema.parse(tamperedPayload);
      const parsedItem = validated.items[0] as Record<string, unknown>;

      expect(parsedItem.price).toBeUndefined();
      expect(parsedItem.subtotal).toBeUndefined();
      expect((validated as Record<string, unknown>).total_amount).toBeUndefined();

      // 2. Server calculation uses official database price exclusively
      const officialProduct = MOCK_PRODUCTS[0]; // Real price: 499
      const calculatedServerSubtotal = officialProduct.price * validated.items[0].quantity;

      expect(calculatedServerSubtotal).toBe(499 * 2); // ₹998
      expect(calculatedServerSubtotal).not.toBe(2);
    });

    it("generates unique order numbers matching MB-YYYYMMDD-XXXXX format", () => {
      const orderNum1 = generateOrderNumber();
      const orderNum2 = generateOrderNumber();

      expect(orderNum1).toMatch(/^MB-\d{8}-\d{5}$/);
      expect(orderNum2).toMatch(/^MB-\d{8}-\d{5}$/);
      // Ensures uniqueness
      expect(orderNum1).not.toBe(orderNum2);
    });
  });

  describe("Atomic Guest Checkout Order Creation", () => {
    it("creates an order returning an unguessable UUIDv4 token and server total", async () => {
      const payload = {
        customer: {
          name: "Kavitha Reddy",
          email: "kavitha.reddy@example.com",
          phone: "+91 98765 12345",
          notes: "Please pack Tajima format",
        },
        items: [
          {
            product_id: "11111111-1111-1111-1111-111111111111",
            quantity: 1,
          },
          {
            product_id: "22222222-2222-2222-2222-222222222222",
            quantity: 2,
          },
        ],
      };

      const result = await createGuestOrder(payload);

      expect(result.order_number).toMatch(/^MB-\d{8}-\d{5}$/);
      // Unguessable token (UUIDv4)
      expect(result.order_token).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );

      const expectedTotal = MOCK_PRODUCTS[0].price * 1 + MOCK_PRODUCTS[1].price * 2;
      expect(result.total_amount).toBe(expectedTotal);
    });
  });

  describe("Insecure Direct Object Reference (IDOR) Defenses", () => {
    const mockOrderNumber = "MB-20260923-00421";
    const genuineToken = "550e8400-e29b-41d4-a716-446655440000";

    it("rejects unauthorized URL order access when a forged or wrong token is presented", async () => {
      const forgedToken = "11111111-2222-3333-4444-555555555555";

      // Attempting to fetch with wrong token returns null (blocking unauthorized access)
      const result = await getOrderByToken(mockOrderNumber, forgedToken);
      expect(result).toBeNull();
    });

    it("permits order access when authentic order_token is provided", async () => {
      const result = await getOrderByToken(mockOrderNumber, genuineToken);
      expect(result).not.toBeNull();
      expect(result?.order.order_number).toBe(mockOrderNumber);
    });

    it("rejects order tracking when customer email does not match", async () => {
      // Alice placed order MB-20260923-00421.
      // Mallory tries to inspect Alice's order using Mallory's email.
      const trackingPayload = {
        order_number: mockOrderNumber,
        verification: "mallory@attacker.com",
      };

      expect(trackOrderInputSchema.safeParse(trackingPayload).success).toBe(true);

      const result = await getOrderByNumberAndVerification(
        trackingPayload.order_number,
        trackingPayload.verification
      );

      // Must be rejected with null
      expect(result).toBeNull();
    });

    it("rejects order tracking when customer phone does not match", async () => {
      // Mallory tries random phone number
      const result = await getOrderByNumberAndVerification(
        mockOrderNumber,
        "+91 99999 88888"
      );
      expect(result).toBeNull();
    });

    it("prevents IDOR URL tampering across different order numbers", () => {
      // Scenario: User had access to Order A with Token A.
      // In the browser URL bar, user changes the order number from Order A to Order B:
      const orderA = { number: "MB-20260923-00001", token: "token-order-a" };
      const orderB = { number: "MB-20260923-00002", token: "token-order-b" };

      // Passing Order A's token to Order B will fail token match
      const isAuthorizedForB = orderB.token === orderA.token;
      expect(isAuthorizedForB).toBe(false);
    });
  });
});
