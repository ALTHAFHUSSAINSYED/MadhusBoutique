import { describe, it, expect } from "vitest";
import { MOCK_PRODUCTS, CATEGORIES } from "@/data/mockProducts";

describe("Catalog Data Integrity", () => {
  it("contains at least 8 realistic embroidery designs", () => {
    expect(MOCK_PRODUCTS.length).toBeGreaterThanOrEqual(8);
  });

  it("ensures each product has a unique ID, product code, and slug", () => {
    const ids = new Set(MOCK_PRODUCTS.map((p) => p.id));
    const codes = new Set(MOCK_PRODUCTS.map((p) => p.product_code));
    const slugs = new Set(MOCK_PRODUCTS.map((p) => p.slug));

    expect(ids.size).toBe(MOCK_PRODUCTS.length);
    expect(codes.size).toBe(MOCK_PRODUCTS.length);
    expect(slugs.size).toBe(MOCK_PRODUCTS.length);
  });

  it("ensures each product belongs to a valid category", () => {
    const validCategories = CATEGORIES.filter((c) => c !== "All");
    MOCK_PRODUCTS.forEach((product) => {
      expect(validCategories).toContain(product.category);
    });
  });

  it("ensures all prices are positive numbers and stitch counts are realistic", () => {
    MOCK_PRODUCTS.forEach((product) => {
      expect(product.price).toBeGreaterThan(0);
      expect(product.stitch_count).toBeGreaterThan(5000);
      expect(product.file_formats.length).toBeGreaterThanOrEqual(1);
      expect(product.dimensions).toBeTruthy();
    });
  });

  it("ensures all products contain standard machine formats like DST or PES", () => {
    MOCK_PRODUCTS.forEach((product) => {
      const hasStandardFormat =
        product.file_formats.includes("DST") || product.file_formats.includes("PES");
      expect(hasStandardFormat).toBe(true);
    });
  });
});
