-- ==============================================================================
-- MADHUS BOUTIQUE: DATABASE INITIAL SCHEMA & SECURITY POLICY
-- PostgreSQL on Supabase Cloud
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE order_status AS ENUM (
      'PENDING_PAYMENT',
      'PAYMENT_SUBMITTED',
      'PAYMENT_VERIFIED',
      'PROCESSING',
      'READY',
      'COMPLETED',
      'CANCELLED',
      'REFUNDED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM (
      'PENDING',
      'SUBMITTED',
      'VERIFIED',
      'REJECTED',
      'REFUNDED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE admin_role AS ENUM (
      'SUPER_ADMIN',
      'ORDER_MANAGER',
      'CONTENT_MANAGER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. CUSTOMERS TABLE (Guest Profiles)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  phone VARCHAR(50) NOT NULL CHECK (length(phone) >= 10),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. PRODUCTS TABLE (Embroidery Catalogue)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  preview_image_key TEXT NOT NULL,
  preview_url TEXT NOT NULL,
  product_file_keys TEXT[] NOT NULL DEFAULT '{}',
  file_format VARCHAR(20) DEFAULT 'DST' NOT NULL,
  file_formats TEXT[] DEFAULT ARRAY['DST', 'PES'] NOT NULL,
  file_size VARCHAR(50),
  stitch_count INTEGER DEFAULT 0 NOT NULL CHECK (stitch_count >= 0),
  dimensions VARCHAR(50) NOT NULL,
  color_stops INTEGER DEFAULT 1 NOT NULL CHECK (color_stops >= 1),
  featured BOOLEAN DEFAULT false NOT NULL,
  status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL CHECK (status IN ('ACTIVE', 'DRAFT', 'ARCHIVED', 'OUT_OF_SALE')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. ORDERS TABLE (Order Lifecycle & Digital Delivery State)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  order_token UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
  discount NUMERIC(10,2) DEFAULT 0.00 NOT NULL CHECK (discount >= 0),
  total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
  payment_status payment_status DEFAULT 'PENDING' NOT NULL,
  order_status order_status DEFAULT 'PENDING_PAYMENT' NOT NULL,
  zip_s3_key TEXT,
  zip_created_at TIMESTAMPTZ,
  download_count INTEGER DEFAULT 0 NOT NULL CHECK (download_count >= 0),
  max_downloads INTEGER DEFAULT 10 NOT NULL CHECK (max_downloads > 0),
  download_expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days') NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. ORDER ITEMS TABLE (Immutable Price Snapshot)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_name_snapshot VARCHAR(255) NOT NULL,
  price_snapshot NUMERIC(10,2) NOT NULL CHECK (price_snapshot >= 0),
  quantity INTEGER DEFAULT 1 NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 7. PAYMENTS TABLE (UPI Reference & Admin Verification)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_method VARCHAR(50) DEFAULT 'UPI_QR' NOT NULL,
  transaction_reference VARCHAR(100) UNIQUE,
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  payment_status payment_status DEFAULT 'SUBMITTED' NOT NULL,
  payer_upi_id VARCHAR(100),
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 8. ADMIN PROFILES TABLE (RBAC & Auth Linkage)
CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE NOT NULL,
  role admin_role DEFAULT 'ORDER_MANAGER' NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  mfa_enabled BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 9. PAYMENT SETTINGS TABLE (Protected Business QR Config)
CREATE TABLE IF NOT EXISTS payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upi_id VARCHAR(100) NOT NULL,
  merchant_name VARCHAR(150) NOT NULL,
  qr_image_s3_key TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  updated_by UUID,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 10. AUDIT LOGS TABLE (Append-Only Administrative Audit Trail)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(100),
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 11. DOWNLOAD LOGS TABLE (Access Tracking & Rate Limiting)
CREATE TABLE IF NOT EXISTS download_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  ip_address VARCHAR(50),
  user_agent TEXT,
  downloaded_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE & SECURITY LOOKUPS
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_product_code ON products(product_code);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_order_token ON orders(order_token);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders(order_status);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_ref ON payments(transaction_reference);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);

CREATE INDEX IF NOT EXISTS idx_admin_profiles_auth ON admin_profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_role ON admin_profiles(role);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON audit_logs(admin_user_id);

CREATE INDEX IF NOT EXISTS idx_download_logs_order ON download_logs(order_id);

-- ==============================================================================
-- AUTOMATIC TIMESTAMPS TRIGGER FUNCTION
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_customers_updated_at ON customers;
CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_payments_updated_at ON payments;
CREATE TRIGGER trg_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_admin_profiles_updated_at ON admin_profiles;
CREATE TRIGGER trg_admin_profiles_updated_at BEFORE UPDATE ON admin_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin role
CREATE OR REPLACE FUNCTION current_admin_role()
RETURNS admin_role AS $$
  SELECT role FROM admin_profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 1. PRODUCTS POLICIES
-- Public & Anon can ONLY read active products
DROP POLICY IF EXISTS "Public can view active products" ON products;
CREATE POLICY "Public can view active products" 
  ON products FOR SELECT 
  TO anon, authenticated 
  USING (status = 'ACTIVE' OR current_admin_role() IN ('SUPER_ADMIN', 'CONTENT_MANAGER'));

-- Only Content Managers & Super Admins can insert/update products
DROP POLICY IF EXISTS "Admins can manage products" ON products;
CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (current_admin_role() IN ('SUPER_ADMIN', 'CONTENT_MANAGER'))
  WITH CHECK (current_admin_role() IN ('SUPER_ADMIN', 'CONTENT_MANAGER'));

-- 2. PAYMENT SETTINGS POLICIES
-- Public & Anon can view active payment settings (to render QR and UPI ID)
DROP POLICY IF EXISTS "Public can view active payment settings" ON payment_settings;
CREATE POLICY "Public can view active payment settings"
  ON payment_settings FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Only Super Admin can modify payment settings
DROP POLICY IF EXISTS "Super Admin can modify payment settings" ON payment_settings;
CREATE POLICY "Super Admin can modify payment settings"
  ON payment_settings FOR ALL
  TO authenticated
  USING (current_admin_role() = 'SUPER_ADMIN')
  WITH CHECK (current_admin_role() = 'SUPER_ADMIN');

-- 3. ADMIN PROFILES POLICIES
-- Admins can view their own profile
DROP POLICY IF EXISTS "Admins can view profiles" ON admin_profiles;
CREATE POLICY "Admins can view profiles"
  ON admin_profiles FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid() OR current_admin_role() = 'SUPER_ADMIN');

-- Only Super Admin can insert/update admin profiles
DROP POLICY IF EXISTS "Super Admin can manage admin profiles" ON admin_profiles;
CREATE POLICY "Super Admin can manage admin profiles"
  ON admin_profiles FOR ALL
  TO authenticated
  USING (current_admin_role() = 'SUPER_ADMIN')
  WITH CHECK (current_admin_role() = 'SUPER_ADMIN');

-- 4. ORDERS & CUSTOMERS POLICIES
-- PUBLIC BROWSER CLIENT (ANON) HAS 0 DIRECT ACCESS TO CUSTOMERS, ORDERS, ORDER_ITEMS, PAYMENTS.
-- ALL GUEST LOOKUPS AND MUTATIONS ARE MEDIATED THROUGH SERVER ROUTE HANDLERS USING SERVICE_ROLE KEY.
-- Authenticated order managers can view & process orders
DROP POLICY IF EXISTS "Order managers can view orders" ON orders;
CREATE POLICY "Order managers can view orders"
  ON orders FOR SELECT
  TO authenticated
  USING (current_admin_role() IN ('SUPER_ADMIN', 'ORDER_MANAGER'));

DROP POLICY IF EXISTS "Order managers can update order status" ON orders;
CREATE POLICY "Order managers can update order status"
  ON orders FOR UPDATE
  TO authenticated
  USING (current_admin_role() IN ('SUPER_ADMIN', 'ORDER_MANAGER'))
  WITH CHECK (current_admin_role() IN ('SUPER_ADMIN', 'ORDER_MANAGER'));

DROP POLICY IF EXISTS "Order managers can view order items" ON order_items;
CREATE POLICY "Order managers can view order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (current_admin_role() IN ('SUPER_ADMIN', 'ORDER_MANAGER'));

DROP POLICY IF EXISTS "Order managers can view customers" ON customers;
CREATE POLICY "Order managers can view customers"
  ON customers FOR SELECT
  TO authenticated
  USING (current_admin_role() IN ('SUPER_ADMIN', 'ORDER_MANAGER'));

-- 5. PAYMENTS POLICIES
-- Only Order Managers and Super Admins can verify payments
DROP POLICY IF EXISTS "Order managers can view payments" ON payments;
CREATE POLICY "Order managers can view payments"
  ON payments FOR SELECT
  TO authenticated
  USING (current_admin_role() IN ('SUPER_ADMIN', 'ORDER_MANAGER'));

DROP POLICY IF EXISTS "Order managers can update payments" ON payments;
CREATE POLICY "Order managers can update payments"
  ON payments FOR UPDATE
  TO authenticated
  USING (current_admin_role() IN ('SUPER_ADMIN', 'ORDER_MANAGER'))
  WITH CHECK (current_admin_role() IN ('SUPER_ADMIN', 'ORDER_MANAGER'));

-- 6. AUDIT LOGS POLICIES
-- Append-only for service_role or authenticated admins; Super Admin can view
DROP POLICY IF EXISTS "Super Admin can view audit logs" ON audit_logs;
CREATE POLICY "Super Admin can view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (current_admin_role() = 'SUPER_ADMIN');

-- Append allowed
DROP POLICY IF EXISTS "Admins can append audit logs" ON audit_logs;
CREATE POLICY "Admins can append audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 7. DOWNLOAD LOGS POLICIES
DROP POLICY IF EXISTS "Admins can view download logs" ON download_logs;
CREATE POLICY "Admins can view download logs"
  ON download_logs FOR SELECT
  TO authenticated
  USING (current_admin_role() IN ('SUPER_ADMIN', 'ORDER_MANAGER'));
