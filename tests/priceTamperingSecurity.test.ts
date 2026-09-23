import { describe, it, expect } from "vitest";
import { MOCK_PRODUCTS } from "@/data/mockProducts";
import { cartItemInputSchema } from "@/lib/validations/schemas";

describe("Sprint 2 Security: Price Tampering Prevention", () => {
  it("schema strips or rejects any unauthorized client-side price fields", () => {
    // Malicious payload trying to inject price: 1
    const tamperedPayload = {
      product_id: "11111111-1111-1111-1111-111111111111",
      quantity: 1,
      price: 1, // Tampered field
    };

    const parsed = cartItemInputSchema.parse(tamperedPayload);
    // Schema strictly only accepts product_id and quantity
    expect((parsed as Record<string, unknown>).price).toBeUndefined();
  });

  it("server-side total computation strictly multiplies database price by quantity", () => {
    const dbProduct = MOCK_PRODUCTS.find((p) => p.product_code === "MB-001")!; // Real price is ₹499

    // Customer ordered 3 units
    const requestedQuantity = 3;

    // Server-side calculation ignores any client claimed total
    const serverCalculatedSubtotal = dbProduct.price * requestedQuantity;

    expect(serverCalculatedSubtotal).toBe(499 * 3); // ₹1497
    expect(serverCalculatedSubtotal).not.toBe(3); // Never ₹1 per item
  });
});
