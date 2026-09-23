import { describe, it, expect } from "vitest";
import { formatPrice, generateOrderNumber, cn } from "@/lib/utils";

describe("Utility Functions", () => {
  it("formats Indian Rupee (INR) currency correctly", () => {
    expect(formatPrice(499)).toMatch(/₹\s?499/);
    expect(formatPrice(199)).toMatch(/₹\s?199/);
    expect(formatPrice(0)).toMatch(/₹\s?0/);
    expect(formatPrice(1499)).toMatch(/₹\s?1,499/);
  });

  it("generates a standard unique order number matching MB-YYYYMMDD-XXXXX pattern", () => {
    const orderNum = generateOrderNumber();
    expect(orderNum).toMatch(/^MB-\d{8}-\d{5}$/);
  });

  it("merges class names correctly with tailwind-merge and clsx", () => {
    const result = cn("px-4 py-2", "px-6", { "bg-red-500": true, "bg-blue-500": false });
    expect(result).toBe("py-2 px-6 bg-red-500");
  });
});
