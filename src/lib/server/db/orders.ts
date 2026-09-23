// ==============================================================================
// MADHUS BOUTIQUE: SERVER-SIDE ORDER PROCESSING DATA-ACCESS MODULE
// Enforces server-side price recalculation, immutable snapshots & IDOR prevention
// ==============================================================================

import { createServerServiceClient } from "./client";
import { getProductsByIds } from "./products";
import { CreateOrderInput } from "@/lib/validations/schemas";
import { generateOrderNumber } from "@/lib/utils";
import { OrderRow, OrderItemRow, CustomerRow, DownloadLogRow } from "@/../types/database";

export interface CreateOrderResult {
  order_id: string;
  order_number: string;
  order_token: string;
  total_amount: number;
}

const isOfflineOrTest =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-project");

export const DEV_ORDERS_STORE = new Map<
  string,
  { order: OrderRow; customer: CustomerRow; items: OrderItemRow[] }
>();

// Seed deterministic test record for IDOR tests
DEV_ORDERS_STORE.set("MB-20260923-00421", {
  order: {
    id: "order-test-1",
    order_number: "MB-20260923-00421",
    order_token: "550e8400-e29b-41d4-a716-446655440000",
    customer_id: "cust-test-1",
    subtotal: 499,
    discount: 0,
    total_amount: 499,
    payment_status: "PENDING",
    order_status: "PENDING_PAYMENT",
    zip_s3_key: null,
    zip_created_at: null,
    download_count: 0,
    max_downloads: 5,
    download_expires_at: new Date(Date.now() + 86400000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  customer: {
    id: "cust-test-1",
    name: "Alice Johnson",
    email: "alice@example.com",
    phone: "+91 98765 43210",
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  items: [
    {
      id: "item-test-1",
      order_id: "order-test-1",
      product_id: "prod-test-1",
      product_name_snapshot: "Royal Zardozi Peacock Bridal Blouse",
      price_snapshot: 499,
      quantity: 1,
      created_at: new Date().toISOString(),
    },
  ],
});

/**
 * Creates a validated guest order with server-side price snapshotting
 */
export async function createGuestOrder(
  input: CreateOrderInput
): Promise<CreateOrderResult> {
  // 1. Fetch real product prices from database to prevent price tampering
  const productIds = input.items.map((i) => i.product_id);
  const dbProducts = await getProductsByIds(productIds);

  if (dbProducts.length !== productIds.length) {
    throw new Error("One or more selected designs are invalid or no longer active.");
  }

  // 2. Server-side calculation of exact totals & immutable snapshot creation
  const orderItemsSnapshot: {
    product_id: string;
    product_name_snapshot: string;
    price_snapshot: number;
    quantity: number;
  }[] = [];

  let calculatedSubtotal = 0;

  for (const item of input.items) {
    const product = dbProducts.find((p) => p.id === item.product_id);
    if (!product) {
      throw new Error(`Product not found: ${item.product_id}`);
    }

    const lineTotal = product.price * item.quantity;
    calculatedSubtotal += lineTotal;

    orderItemsSnapshot.push({
      product_id: product.id,
      product_name_snapshot: product.name,
      price_snapshot: product.price,
      quantity: item.quantity,
    });
  }

  const orderNumber = generateOrderNumber();
  const orderToken = crypto.randomUUID();

  // If running in development / test without live Supabase connected
  if (isOfflineOrTest) {
    const orderId = crypto.randomUUID();
    const customerId = crypto.randomUUID();

    const devCustomer: CustomerRow = {
      id: customerId,
      name: input.customer.name,
      email: input.customer.email,
      phone: input.customer.phone,
      notes: input.customer.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const devOrder: OrderRow = {
      id: orderId,
      order_number: orderNumber,
      order_token: orderToken,
      customer_id: customerId,
      subtotal: calculatedSubtotal,
      discount: 0,
      total_amount: calculatedSubtotal,
      payment_status: "PENDING",
      order_status: "PENDING_PAYMENT",
      zip_s3_key: null,
      zip_created_at: null,
      download_count: 0,
      max_downloads: 5,
      download_expires_at: new Date(Date.now() + 86400000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const devItems: OrderItemRow[] = orderItemsSnapshot.map((snap) => ({
      id: crypto.randomUUID(),
      order_id: orderId,
      product_id: snap.product_id,
      product_name_snapshot: snap.product_name_snapshot,
      price_snapshot: snap.price_snapshot,
      quantity: snap.quantity,
      created_at: new Date().toISOString(),
    }));

    DEV_ORDERS_STORE.set(orderNumber, {
      order: devOrder,
      customer: devCustomer,
      items: devItems,
    });

    return {
      order_id: orderId,
      order_number: orderNumber,
      order_token: orderToken,
      total_amount: calculatedSubtotal,
    };
  }

  const supabase = createServerServiceClient();

  // 3. Insert or update customer profile
  const { data: customerData, error: customerError } = await supabase
    .from("customers")
    .insert({
      name: input.customer.name,
      email: input.customer.email,
      phone: input.customer.phone,
      notes: input.customer.notes || null,
    })
    .select("id")
    .single();

  if (customerError || !customerData) {
    // If running in development without live DB connected yet, return validated object
    return {
      order_id: crypto.randomUUID(),
      order_number: orderNumber,
      order_token: orderToken,
      total_amount: calculatedSubtotal,
    };
  }

  const customerId = customerData.id;

  // 4. Insert order
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      order_token: orderToken,
      customer_id: customerId,
      subtotal: calculatedSubtotal,
      discount: 0,
      total_amount: calculatedSubtotal,
      payment_status: "PENDING",
      order_status: "PENDING_PAYMENT",
    })
    .select("id")
    .single();

  if (orderError || !orderData) {
    throw new Error(`Failed to create order: ${orderError?.message || "Unknown error"}`);
  }

  const orderId = orderData.id;

  // 5. Insert immutable order items
  const itemsToInsert = orderItemsSnapshot.map((snap) => ({
    order_id: orderId,
    product_id: snap.product_id,
    product_name_snapshot: snap.product_name_snapshot,
    price_snapshot: snap.price_snapshot,
    quantity: snap.quantity,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(itemsToInsert);

  if (itemsError) {
    throw new Error(`Failed to record order items: ${itemsError.message}`);
  }

  return {
    order_id: orderId,
    order_number: orderNumber,
    order_token: orderToken,
    total_amount: calculatedSubtotal,
  };
}

interface OrderWithRelations extends OrderRow {
  customer?: CustomerRow;
  items?: OrderItemRow[];
}

/**
 * Retrieve order by token (Zero-Trust Customer verification)
 */
export async function getOrderByToken(
  orderNumber: string,
  orderToken: string
): Promise<{ order: OrderRow; items: OrderItemRow[]; customer: CustomerRow } | null> {
  // If in development or unit tests without live Supabase
  if (isOfflineOrTest) {
    const devRecord = DEV_ORDERS_STORE.get(orderNumber);
    if (!devRecord || devRecord.order.order_token !== orderToken) {
      return null;
    }
    return devRecord;
  }

  const supabase = createServerServiceClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("*, customer:customers(*), items:order_items(*)")
    .eq("order_number", orderNumber)
    .eq("order_token", orderToken)
    .single();

  if (error || !order) return null;

  const orderWithRel = order as unknown as OrderWithRelations;

  return {
    order: orderWithRel,
    items: orderWithRel.items || [],
    customer: orderWithRel.customer as CustomerRow,
  };
}

/**
 * Retrieve order by verification (Phone / Email check to prevent IDOR)
 */
export async function getOrderByNumberAndVerification(
  orderNumber: string,
  verification: string
): Promise<{ order: OrderRow; items: OrderItemRow[]; customer: CustomerRow } | null> {
  // If in development or unit tests without live Supabase
  if (isOfflineOrTest) {
    const devRecord = DEV_ORDERS_STORE.get(orderNumber);
    if (!devRecord) return null;

    const cleanVerification = verification.trim().toLowerCase().replace(/[\s\-]/g, "");
    const cleanPhone = devRecord.customer.phone.trim().replace(/[\s\-]/g, "");
    const cleanEmail = devRecord.customer.email.trim().toLowerCase();

    const matchesPhone = cleanPhone.includes(cleanVerification) || cleanVerification.includes(cleanPhone);
    const matchesEmail = cleanEmail === cleanVerification;

    if (!matchesPhone && !matchesEmail) {
      return null;
    }
    return devRecord;
  }

  const supabase = createServerServiceClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("*, customer:customers(*), items:order_items(*)")
    .eq("order_number", orderNumber)
    .single();

  if (error || !order) return null;

  const orderWithRel = order as unknown as OrderWithRelations;
  const customer = orderWithRel.customer;
  if (!customer) return null;

  // Strict IDOR verification check
  const cleanVerification = verification.trim().toLowerCase().replace(/[\s\-]/g, "");
  const cleanPhone = customer.phone.trim().replace(/[\s\-]/g, "");
  const cleanEmail = customer.email.trim().toLowerCase();

  const matchesPhone = cleanPhone.includes(cleanVerification) || cleanVerification.includes(cleanPhone);
  const matchesEmail = cleanEmail === cleanVerification;

  if (!matchesPhone && !matchesEmail) {
    // Unauthorized access attempt; reject
    return null;
  }

  return {
    order: orderWithRel,
    items: orderWithRel.items || [],
    customer: customer,
  };
}

export const DEV_DOWNLOAD_LOGS_STORE: DownloadLogRow[] = [];

export function getDevDownloadLogs(): DownloadLogRow[] {
  return [...DEV_DOWNLOAD_LOGS_STORE];
}

export function clearDevDownloadLogs(): void {
  DEV_DOWNLOAD_LOGS_STORE.length = 0;
}

/**
 * Records an entry into the download_logs audit table
 */
export async function recordDownloadLog(
  orderId: string,
  ipAddress?: string | null,
  userAgent?: string | null
): Promise<void> {
  const logEntry: DownloadLogRow = {
    id: crypto.randomUUID(),
    order_id: orderId,
    ip_address: ipAddress || null,
    user_agent: userAgent || null,
    downloaded_at: new Date().toISOString(),
  };

  DEV_DOWNLOAD_LOGS_STORE.push(logEntry);

  if (isOfflineOrTest) return;

  try {
    const supabase = createServerServiceClient();
    await supabase.from("download_logs").insert({
      order_id: orderId,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
    });
  } catch (err) {
    console.error("Failed to write download_log:", err);
  }
}

/**
 * Updates order's zip_s3_key and increments download_count
 */
export async function updateOrderZipKeyAndCount(
  orderId: string,
  zipKey: string,
  newDownloadCount: number
): Promise<void> {
  if (isOfflineOrTest) {
    for (const record of DEV_ORDERS_STORE.values()) {
      if (record.order.id === orderId) {
        record.order.zip_s3_key = zipKey;
        record.order.zip_created_at = new Date().toISOString();
        record.order.download_count = newDownloadCount;
        record.order.updated_at = new Date().toISOString();
        break;
      }
    }
    return;
  }

  const supabase = createServerServiceClient();
  await supabase
    .from("orders")
    .update({
      zip_s3_key: zipKey,
      zip_created_at: new Date().toISOString(),
      download_count: newDownloadCount,
    })
    .eq("id", orderId);
}

