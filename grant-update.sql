-- 除了 RLS Policy 之外，還需要賦予角色 UPDATE 的權限
GRANT UPDATE ON public.products TO anon;
GRANT UPDATE ON public.products TO authenticated;
