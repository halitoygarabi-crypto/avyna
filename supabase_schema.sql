
-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  category TEXT,
  description TEXT,
  stock INTEGER DEFAULT 0,
  images JSONB,
  modelurl TEXT,
  videourl TEXT,
  dimensions JSONB,
  colors JSONB DEFAULT '[]'::jsonb,
  fabric_properties JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  address TEXT,
  total_amount NUMERIC,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT,
  quantity INTEGER DEFAULT 1,
  price NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- === Row Level Security (RLS) Configuration ===
-- This fixes the "RLS Disabled in Public" warnings in Supabase Dashboard

-- 1. Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 2. Policies for 'products' table
-- Allow anyone to view products
CREATE POLICY "Public Read" ON products FOR SELECT USING (true);
-- Allow all operations for anon (matching current app behavior)
-- Note: In production, you should restrict INSERT/UPDATE/DELETE to 'authenticated' users
CREATE POLICY "Anon All" ON products FOR ALL TO anon USING (true) WITH CHECK (true);

-- 3. Policies for 'orders' table
-- Allow anyone to create an order
CREATE POLICY "Public Insert" ON orders FOR INSERT WITH CHECK (true);
-- Allow anon to read/manage orders
CREATE POLICY "Anon All" ON orders FOR ALL TO anon USING (true) WITH CHECK (true);

-- 4. Policies for 'order_items' table
-- Allow anyone to add items to an order
CREATE POLICY "Public Insert" ON order_items FOR INSERT WITH CHECK (true);
-- Allow anon to manage order items
CREATE POLICY "Anon All" ON order_items FOR ALL TO anon USING (true) WITH CHECK (true);
