-- ========================================
-- 修復 Supabase 前端讀取權限問題
-- ========================================

-- 步驟 1: 先檢查目前的 RLS 狀態
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('products', 'brands');

-- 步驟 2: 授予 anon 和 authenticated 角色對表的讀取權限
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.brands TO anon, authenticated;

-- 步驟 3: 刪除舊的 RLS 政策（如果存在）
DROP POLICY IF EXISTS "Allow anonymous read access to products" ON products;
DROP POLICY IF EXISTS "Allow anonymous read access to brands" ON brands;

-- 步驟 4: 啟用 RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- 步驟 5: 建立新的 RLS 政策（允許所有人讀取）
CREATE POLICY "Allow public read access to products"
ON products
FOR SELECT
USING (true);

CREATE POLICY "Allow public read access to brands"
ON brands
FOR SELECT
USING (true);

-- 步驟 6: 驗證政策已建立
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename IN ('products', 'brands');
