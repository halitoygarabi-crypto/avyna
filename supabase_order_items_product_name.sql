-- Add product_name column to order_items so we can display it in the orders panel
-- Run this in Supabase SQL Editor

ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_name TEXT;
