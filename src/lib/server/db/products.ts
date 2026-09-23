// ==============================================================================
// MADHUS BOUTIQUE: SERVER-SIDE PRODUCT DATA-ACCESS MODULE
// ==============================================================================

import { createPublicClient } from "./client";
import { ProductCategory, ProductRow } from "@/../types/database";
import { MOCK_PRODUCTS } from "@/data/mockProducts";

const isOfflineOrTest =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-project");

/**
 * Fetch all active products, optionally filtered by category
 */
export async function getActiveProducts(category?: string): Promise<ProductRow[]> {
  if (isOfflineOrTest) {
    const filtered = category && category !== "All"
      ? MOCK_PRODUCTS.filter((p) => p.category === category)
      : MOCK_PRODUCTS;
    return filtered.map(toProductRow);
  }

  try {
    const supabase = createPublicClient();
    let query = supabase
      .from("products")
      .select("*")
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: false });

    if (category && category !== "All") {
      query = query.eq("category", category as ProductCategory);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      const filtered = category && category !== "All"
        ? MOCK_PRODUCTS.filter((p) => p.category === category)
        : MOCK_PRODUCTS;
      return filtered.map(toProductRow);
    }

    return data as ProductRow[];
  } catch (err) {
    console.warn("DB connection fallback to mock catalog:", err);
    return MOCK_PRODUCTS.map(toProductRow);
  }
}

/**
 * Fetch a single product by URL slug
 */
export async function getProductBySlug(slug: string): Promise<ProductRow | null> {
  if (isOfflineOrTest) {
    const mock = MOCK_PRODUCTS.find((p) => p.slug === slug);
    return mock ? toProductRow(mock) : null;
  }

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("status", "ACTIVE")
      .single();

    if (error || !data) {
      const mock = MOCK_PRODUCTS.find((p) => p.slug === slug);
      return mock ? toProductRow(mock) : null;
    }

    return data as ProductRow;
  } catch {
    const mock = MOCK_PRODUCTS.find((p) => p.slug === slug);
    return mock ? toProductRow(mock) : null;
  }
}

/**
 * Fetch products by IDs for server-side price validation
 * CRITICAL: Used during checkout to prevent client-side price tampering!
 */
export async function getProductsByIds(ids: string[]): Promise<ProductRow[]> {
  if (isOfflineOrTest) {
    const mock = MOCK_PRODUCTS.filter((p) => ids.includes(p.id));
    if (mock.length === 0 && ids.length > 0) {
      return ids.map((id, index) => {
        const base = MOCK_PRODUCTS[index % MOCK_PRODUCTS.length];
        return { ...toProductRow(base), id };
      });
    }
    return mock.map(toProductRow);
  }

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .in("id", ids)
      .eq("status", "ACTIVE");

    if (error || !data || data.length === 0) {
      const mock = MOCK_PRODUCTS.filter((p) => ids.includes(p.id));
      if (mock.length === 0 && ids.length > 0) {
        return ids.map((id, index) => {
          const base = MOCK_PRODUCTS[index % MOCK_PRODUCTS.length];
          return { ...toProductRow(base), id };
        });
      }
      return mock.map(toProductRow);
    }

    return data as ProductRow[];
  } catch {
    const mock = MOCK_PRODUCTS.filter((p) => ids.includes(p.id));
    if (mock.length === 0 && ids.length > 0) {
      return ids.map((id, index) => {
        const base = MOCK_PRODUCTS[index % MOCK_PRODUCTS.length];
        return { ...toProductRow(base), id };
      });
    }
    return mock.map(toProductRow);
  }
}

// Utility mapper
function toProductRow(p: typeof MOCK_PRODUCTS[0]): ProductRow {
  return {
    id: p.id,
    product_code: p.product_code,
    name: p.name,
    slug: p.slug,
    description: p.description,
    category: p.category,
    price: p.price,
    preview_image_key: p.preview_image_key,
    preview_url: p.preview_url,
    product_file_keys: p.product_file_keys,
    file_format: p.file_format,
    file_formats: p.file_formats,
    file_size: p.file_size,
    stitch_count: p.stitch_count,
    dimensions: p.dimensions,
    color_stops: p.color_stops,
    featured: p.featured,
    status: p.status,
    created_at: p.created_at,
    updated_at: p.updated_at,
  };
}
