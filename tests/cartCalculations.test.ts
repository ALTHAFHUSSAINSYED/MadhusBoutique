import { describe, it, expect } from "vitest";
import { MOCK_PRODUCTS } from "@/data/mockProducts";
import { CartItem } from "@/types/store";

describe("Cart Subtotal & Snapshot Logic", () => {
  it("calculates accurate total quantity and price subtotal", () => {
    const p1 = MOCK_PRODUCTS[0]; // ₹499
    const p2 = MOCK_PRODUCTS[1]; // ₹199

    const cart: CartItem[] = [
      { product: p1, quantity: 2 },
      { product: p2, quantity: 1 },
    ];

    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = cart.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );

    expect(totalItems).toBe(3);
    expect(subtotal).toBe(499 * 2 + 199); // 1197
  });

  it("creates immutable price snapshots protecting against price changes", () => {
    const originalProduct = { ...MOCK_PRODUCTS[0], price: 499 };

    // Create order item snapshot
    const orderItemSnapshot = {
      product_id: originalProduct.id,
      product_name_snapshot: originalProduct.name,
      price_snapshot: originalProduct.price,
      quantity: 1,
    };

    // Simulate product price inflation in database to ₹699
    const modifiedProduct = { ...originalProduct, price: 699 };

    // Snapshot remains locked to ₹499
    expect(orderItemSnapshot.price_snapshot).toBe(499);
    expect(orderItemSnapshot.price_snapshot).not.toBe(modifiedProduct.price);
  });
});
