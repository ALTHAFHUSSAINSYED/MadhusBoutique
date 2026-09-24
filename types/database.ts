// ==============================================================================
// MADHUS BOUTIQUE: SUPABASE POSTGRESQL DATABASE TYPE DEFINITIONS
// ==============================================================================

import type { ContactInfo, BrandAssets, ThemeColors, PagesContent } from "./siteSettings";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

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

export type AdminRole =
  | 'SUPER_ADMIN'
  | 'ORDER_MANAGER'
  | 'CONTENT_MANAGER';

export type EmbroideryFormat = 'DST' | 'PES' | 'JEF' | 'EXP';

export type ProductCategory =
  | 'Bridal'
  | 'Floral'
  | 'Kids'
  | 'Saree'
  | 'Blouse'
  | 'Neck Designs'
  | 'Custom';

export type CustomerRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductRow = {
  id: string;
  product_code: string;
  name: string;
  slug: string;
  description: string | null;
  category: ProductCategory;
  price: number;
  preview_image_key: string;
  preview_url: string;
  product_file_keys: string[];
  file_format: string;
  file_formats: EmbroideryFormat[];
  file_size: string | null;
  stitch_count: number;
  dimensions: string;
  color_stops: number;
  featured: boolean;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED' | 'OUT_OF_SALE';
  created_at: string;
  updated_at: string;
};

export type OrderRow = {
  id: string;
  order_number: string;
  order_token: string;
  customer_id: string;
  subtotal: number;
  discount: number;
  total_amount: number;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  zip_s3_key: string | null;
  zip_created_at: string | null;
  download_count: number;
  max_downloads: number;
  download_expires_at: string;
  created_at: string;
  updated_at: string;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string;
  product_name_snapshot: string;
  price_snapshot: number;
  quantity: number;
  created_at: string;
};

export type PaymentRow = {
  id: string;
  order_id: string;
  payment_method: string;
  transaction_reference: string | null;
  amount: number;
  payment_status: PaymentStatus;
  payer_upi_id: string | null;
  verified_by: string | null;
  verified_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminProfileRow = {
  id: string;
  auth_user_id: string;
  role: AdminRole;
  full_name: string;
  mfa_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type PaymentSettingRow = {
  id: string;
  upi_id: string;
  merchant_name: string;
  qr_image_s3_key: string | null;
  is_active: boolean;
  updated_by: string | null;
  updated_at: string;
};

export type AuditLogRow = {
  id: string;
  admin_user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

export type DownloadLogRow = {
  id: string;
  order_id: string;
  ip_address: string | null;
  user_agent: string | null;
  downloaded_at: string;
};

export type SiteSettingRow = {
  id: string;
  contact_info: ContactInfo;
  brand_assets: BrandAssets;
  theme_colors: ThemeColors;
  pages_content: PagesContent;
  updated_by: string | null;
  updated_at: string;
};

// Database schema definition for Supabase client
export type Database = {
  public: {
    Tables: {
      customers: {
        Row: CustomerRow;
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: ProductRow;
        Insert: {
          id?: string;
          product_code: string;
          name: string;
          slug: string;
          description?: string | null;
          category: ProductCategory;
          price: number;
          preview_image_key: string;
          preview_url: string;
          product_file_keys: string[];
          file_format?: string;
          file_formats?: EmbroideryFormat[];
          file_size?: string | null;
          stitch_count?: number;
          dimensions: string;
          color_stops?: number;
          featured?: boolean;
          status?: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_code?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          category?: ProductCategory;
          price?: number;
          preview_image_key?: string;
          preview_url?: string;
          product_file_keys?: string[];
          file_format?: string;
          file_formats?: EmbroideryFormat[];
          file_size?: string | null;
          stitch_count?: number;
          dimensions?: string;
          color_stops?: number;
          featured?: boolean;
          status?: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: OrderRow;
        Insert: {
          id?: string;
          order_number: string;
          order_token?: string;
          customer_id: string;
          subtotal: number;
          discount?: number;
          total_amount: number;
          payment_status?: PaymentStatus;
          order_status?: OrderStatus;
          zip_s3_key?: string | null;
          zip_created_at?: string | null;
          download_count?: number;
          max_downloads?: number;
          download_expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          payment_status?: PaymentStatus;
          order_status?: OrderStatus;
          zip_s3_key?: string | null;
          zip_created_at?: string | null;
          download_count?: number;
          max_downloads?: number;
          download_expires_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          }
        ];
      };
      order_items: {
        Row: OrderItemRow;
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          product_name_snapshot: string;
          price_snapshot: number;
          quantity?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          quantity?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      payments: {
        Row: PaymentRow;
        Insert: {
          id?: string;
          order_id: string;
          payment_method?: string;
          transaction_reference?: string | null;
          amount: number;
          payment_status?: PaymentStatus;
          payer_upi_id?: string | null;
          verified_by?: string | null;
          verified_at?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          payment_status?: PaymentStatus;
          verified_by?: string | null;
          verified_at?: string | null;
          rejection_reason?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          }
        ];
      };
      admin_profiles: {
        Row: AdminProfileRow;
        Insert: {
          id?: string;
          auth_user_id: string;
          role?: AdminRole;
          full_name: string;
          mfa_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: AdminRole;
          full_name?: string;
          mfa_enabled?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      payment_settings: {
        Row: PaymentSettingRow;
        Insert: {
          id?: string;
          upi_id: string;
          merchant_name: string;
          qr_image_s3_key?: string | null;
          is_active?: boolean;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          upi_id?: string;
          merchant_name?: string;
          qr_image_s3_key?: string | null;
          is_active?: boolean;
          updated_by?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: AuditLogRow;
        Insert: {
          id?: string;
          admin_user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Record<string, unknown>;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_user_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          metadata?: Record<string, unknown>;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      download_logs: {
        Row: DownloadLogRow;
        Insert: {
          id?: string;
          order_id: string;
          ip_address?: string | null;
          user_agent?: string | null;
          downloaded_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          downloaded_at?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: SiteSettingRow;
        Insert: {
          id?: string;
          contact_info: ContactInfo;
          brand_assets: BrandAssets;
          theme_colors: ThemeColors;
          pages_content: PagesContent;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          contact_info?: ContactInfo;
          brand_assets?: BrandAssets;
          theme_colors?: ThemeColors;
          pages_content?: PagesContent;
          updated_by?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      order_status: OrderStatus;
      payment_status: PaymentStatus;
      admin_role: AdminRole;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
