export type EmbroideryFormat = 'DST' | 'PES' | 'JEF' | 'EXP';

export type ProductCategory =
  | 'Bridal'
  | 'Floral'
  | 'Kids'
  | 'Saree'
  | 'Blouse'
  | 'Neck Designs'
  | 'Custom';

export interface Product {
  id: string;
  product_code: string;
  name: string;
  slug: string;
  description: string;
  category: ProductCategory;
  price: number;
  preview_url: string;
  preview_image_key: string;
  product_file_keys: string[];
  file_format: EmbroideryFormat;
  file_formats: EmbroideryFormat[];
  file_size: string;
  stitch_count: number;
  dimensions: string;
  color_stops: number;
  featured: boolean;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED' | 'OUT_OF_SALE';
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface GuestCheckoutForm {
  name: string;
  email: string;
  phone: string;
  notes?: string;
}

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_SUBMITTED'
  | 'PAYMENT_VERIFIED'
  | 'PROCESSING'
  | 'READY'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentStatus =
  | 'PENDING'
  | 'SUBMITTED'
  | 'VERIFIED'
  | 'REJECTED'
  | 'REFUNDED';

export interface OrderSnapshot {
  order_number: string;
  order_token: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: {
    product_code: string;
    name: string;
    price: number;
    quantity: number;
    formats: EmbroideryFormat[];
  }[];
  subtotal: number;
  discount: number;
  total_amount: number;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  created_at: string;
}
