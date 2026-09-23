// ==============================================================================
// MADHUS BOUTIQUE: SERVER-SIDE DIGITAL ASSET DELIVERY & ZIP PIPELINE
// Strict zero-trust file resolution, private S3 ZIP packaging & audit logging
// ==============================================================================

import JSZip from "jszip";
import { getOrderByToken, recordDownloadLog, updateOrderZipKeyAndCount } from "../db/orders";
import { getProductsByIds } from "../db/products";
import { downloadS3ObjectBuffer, uploadS3ObjectBuffer, generateDownloadPresignedUrl } from "./presign";
import { buildOrderDownloadKey } from "./keys";

export interface DigitalDeliveryResult {
  success: boolean;
  order_number: string;
  download_url: string;
  expires_in_seconds: number;
  download_count: number;
  max_downloads: number;
  expires_at: string;
  files_count: number;
}

/**
 * Executes secure digital delivery pipeline for a verified order:
 * 1. Loads and verifies order and unguessable token (IDOR defense)
 * 2. Checks payment verification status (VERIFIED required)
 * 3. Enforces 30-day download expiry and max downloads quota
 * 4. Resolves purchased S3 keys strictly from database product records (Zero client trust)
 * 5. Verifies every object belongs to purchased products
 * 6. Downloads objects server-side from private S3
 * 7. Packages files into an in-memory ZIP archive with license and machine guide
 * 8. Uploads ZIP archive to private S3 (orders/{order-number}/downloads/*)
 * 9. Stores zip_s3_key and updates download_count
 * 10. Generates short-lived (15 min) presigned download URL
 * 11. Records access in download_logs audit trail
 */
export async function generateOrderZipArchive(
  orderNumber: string,
  orderToken: string,
  clientIp?: string | null,
  userAgent?: string | null
): Promise<DigitalDeliveryResult> {
  // 1. Load order and verify unguessable security token (IDOR Defense)
  const orderDetails = await getOrderByToken(orderNumber, orderToken);
  if (!orderDetails) {
    throw new Error("UNAUTHORIZED: Invalid order number or security access token.");
  }

  const { order, items, customer } = orderDetails;

  // 2. Verify order payment status
  if (order.payment_status !== "VERIFIED") {
    throw new Error(
      "PAYMENT_REQUIRED: Digital design assets are locked until payment is verified by our team."
    );
  }

  // 3. Enforce 30-Day Expiration
  const now = new Date();
  const expiresAt = new Date(order.download_expires_at);
  if (now > expiresAt) {
    throw new Error(
      "EXPIRED: The 30-day digital download window for this order has expired. Please contact support."
    );
  }

  // 4. Enforce Max Download Quota
  if (order.download_count >= order.max_downloads) {
    throw new Error(
      `QUOTA_EXCEEDED: Maximum download limit (${order.max_downloads}/${order.max_downloads}) reached. Please contact support.`
    );
  }

  // 5. Load order items and resolve purchased product IDs
  if (!items || items.length === 0) {
    throw new Error("EMPTY_ORDER: No design items found in this order.");
  }

  const productIds = items.map((i) => i.product_id);

  // 6. Resolve authoritative products and S3 keys from database (Never trust client)
  const products = await getProductsByIds(productIds);
  if (!products || products.length === 0) {
    throw new Error("PRODUCT_RESOLUTION_ERROR: Unable to locate design catalogue records.");
  }

  // 7. Verify every object belongs strictly to the purchased products
  const verifiedFileEntries: Array<{ key: string; productCode: string; filename: string }> = [];

  for (const product of products) {
    const fileKeys = product.product_file_keys || [];
    for (const key of fileKeys) {
      // Validate key prefix matches product code
      const expectedPrefix = `products/${product.product_code}/files/`;
      if (!key.startsWith(expectedPrefix)) {
        throw new Error(
          `SECURITY_VIOLATION: S3 key "${key}" does not belong to purchased product "${product.product_code}".`
        );
      }

      const filename = key.split("/").pop() || `${product.product_code}.dst`;
      verifiedFileEntries.push({
        key,
        productCode: product.product_code,
        filename,
      });
    }
  }

  if (verifiedFileEntries.length === 0) {
    throw new Error("NO_FILES_FOUND: No digital files configured for purchased products.");
  }

  // 8. Download objects server-side & package into ZIP
  const zip = new JSZip();

  // Add embroidery instruction & commercial license guide
  const licenseText = [
    "================================================================================",
    "MADHUS BOUTIQUE - DIGITAL EMBROIDERY ARCHIVE",
    `Order Number: ${order.order_number}`,
    `Customer Name: ${customer.name}`,
    `Generated On: ${new Date().toISOString()}`,
    "================================================================================",
    "",
    "INCLUDED MACHINE FORMATS:",
    "- .DST: Tajima / SWF / Barudan commercial embroidery machines",
    "- .PES: Brother / Babylock / Bernina home & semi-commercial machines",
    "- .JEF: Janome / Elna machines",
    "- .EXP: Melco / Bernina multi-needle commercial machines",
    "",
    "RECOMMENDED MACHINE SETTINGS:",
    "1. Always conduct a test run on scrap fabric with appropriate backing/stabilizer.",
    "2. Needle recommendation: 75/11 sharp embroidery needles for woven fabrics, 75/11 ballpoint for knits.",
    "3. Thread tension: Ensure top thread tension is calibrated to reveal approx 1/3 bobbin thread on underside.",
    "4. Stitch speed: Recommended 600 - 800 RPM for highest detail clarity.",
    "",
    "LICENSE & COPYRIGHT NOTICE:",
    "Madhus Boutique grants the purchaser a non-exclusive, non-transferable commercial license",
    "to stitch physical garments using these designs. Digital resale, redistribution, modification",
    "for digital resale, or sharing of the raw embroidery design files is strictly prohibited by law.",
    "================================================================================",
  ].join("\n");

  zip.file("LICENSE_AND_INSTRUCTIONS.txt", licenseText);

  // Download each file server-side and add to ZIP
  for (const entry of verifiedFileEntries) {
    const fileBuffer = await downloadS3ObjectBuffer(entry.key);
    // Organize in folders by product code
    const zipPath = `${entry.productCode}/${entry.filename}`;
    zip.file(zipPath, fileBuffer);
  }

  // Generate ZIP archive binary buffer
  const zipBuffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  // 9. Upload ZIP to private S3: orders/{order-number}/downloads/{order-number}-designs.zip
  const zipFilename = `${order.order_number}-designs.zip`;
  const zipKey = buildOrderDownloadKey(order.order_number, zipFilename);

  await uploadS3ObjectBuffer(zipKey, zipBuffer, "application/zip");

  // 10. Update order database record (zip_s3_key, zip_created_at, increment download_count)
  const newDownloadCount = order.download_count + 1;
  await updateOrderZipKeyAndCount(order.id, zipKey, newDownloadCount);

  // 11. Append audit log entry in download_logs
  await recordDownloadLog(order.id, clientIp, userAgent);

  // 12. Generate short-lived presigned URL (15 min TTL, attachment disposition)
  const presigned = await generateDownloadPresignedUrl({
    key: zipKey,
    downloadFilename: zipFilename,
    expiresInSeconds: 900, // 15 minutes
  });

  return {
    success: true,
    order_number: order.order_number,
    download_url: presigned.downloadUrl,
    expires_in_seconds: presigned.expiresInSeconds,
    download_count: newDownloadCount,
    max_downloads: order.max_downloads,
    expires_at: order.download_expires_at,
    files_count: verifiedFileEntries.length,
  };
}
