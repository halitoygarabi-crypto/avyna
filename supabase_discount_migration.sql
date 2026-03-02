
-- ═══════════════════════════════════════════════════════
-- AVYNA - İndirimli Fiyat Migration
-- Bu SQL'i Supabase Dashboard > SQL Editor'de çalıştırın
-- ═══════════════════════════════════════════════════════

-- 1. products tablosuna indirimli fiyat sütunu ekle
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_price NUMERIC;

-- Doğrulama: Sütunun eklendiğini kontrol edin
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'discount_price';
