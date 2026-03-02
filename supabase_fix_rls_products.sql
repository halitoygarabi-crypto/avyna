-- ============================================================
-- Supabase RLS Politikaları - products tablosu için DELETE izni
-- Bu komutu Supabase Dashboard > SQL Editor'de çalıştırın
-- ============================================================

-- Mevcut politikaları kontrol et
SELECT tablename, policyname, cmd FROM pg_policies WHERE tablename = 'products';

-- Eğer RLS açıksa ama DELETE politikası yoksa, aşağıdakini çalıştırın:

-- Seçenek 1: Herkese DELETE izni (anon + authenticated)
CREATE POLICY "Allow delete for all" ON products
  FOR DELETE
  USING (true);

-- Eğer yukarıdaki "already exists" hatası verirse, mevcut politikayı güncelleyin:
-- DROP POLICY IF EXISTS "Allow delete for all" ON products;
-- CREATE POLICY "Allow delete for all" ON products FOR DELETE USING (true);

-- Ayrıca UPDATE için de politika ekleyin (güncelleme de sorun yaşanabilir):
CREATE POLICY "Allow update for all" ON products
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- INSERT için de:
CREATE POLICY "Allow insert for all" ON products
  FOR INSERT
  WITH CHECK (true);

-- SELECT için de:
CREATE POLICY "Allow select for all" ON products
  FOR SELECT
  USING (true);
