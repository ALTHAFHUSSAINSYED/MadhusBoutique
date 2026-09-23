// ==============================================================================
// MADHUS BOUTIQUE: SECURE PRODUCT PREVIEW DELIVERY API
// Generates short-lived presigned URL for active product preview images
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/server/db/products";
import { getSecurePreviewUrl } from "@/lib/server/s3/operations";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json({ error: "Product slug is required." }, { status: 400 });
    }

    const product = await getProductBySlug(slug);

    if (!product || product.status !== "ACTIVE") {
      return NextResponse.json({ error: "Product not found or not active." }, { status: 404 });
    }

    // If preview is stored in private S3 bucket
    if (product.preview_image_key && product.preview_image_key.startsWith("products/")) {
      const { previewUrl, expiresInSeconds } = await getSecurePreviewUrl(
        product.preview_image_key
      );

      return NextResponse.json({
        success: true,
        preview_url: previewUrl,
        expires_in_seconds: expiresInSeconds,
      });
    }

    // Default to stored public preview URL
    return NextResponse.json({
      success: true,
      preview_url: product.preview_url,
      expires_in_seconds: null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
