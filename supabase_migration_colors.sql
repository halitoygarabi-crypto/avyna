
-- ═══════════════════════════════════════════════════════
-- AVYNA - Renk & Kumaş Migration
-- Bu SQL'i Supabase Dashboard > SQL Editor'de çalıştırın
-- ═══════════════════════════════════════════════════════

-- 1. colors sütunu ekle (JSONB array: [{name: "Krem", hex: "#F5F0E8"}])
ALTER TABLE products ADD COLUMN IF NOT EXISTS colors JSONB DEFAULT '[]'::jsonb;

-- 2. fabric_properties sütunu ekle (JSONB object)
ALTER TABLE products ADD COLUMN IF NOT EXISTS fabric_properties JSONB;

-- 3. videourl sütunu ekle (eğer yoksa)
ALTER TABLE products ADD COLUMN IF NOT EXISTS videourl TEXT;

-- Doğrulama: Sütunların eklendiğini kontrol edin
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;
