
-- ═══════════════════════════════════════════════════════
-- AVYNA - Sipariş Renk Migration
-- Bu SQL'i Supabase Dashboard > SQL Editor'de çalıştırın
-- ═══════════════════════════════════════════════════════

-- 1. order_items tablosuna seçili renk bilgisi ekle
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS selected_color_name TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS selected_color_hex TEXT;

-- Doğrulama: Sütunların eklendiğini kontrol edin
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'order_items' 
ORDER BY ordinal_position;
