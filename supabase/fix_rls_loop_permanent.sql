-- Sree Vaari Traders
-- Permanent Fix for "Infinite Recursion on profiles"

-- EXPLANTION:
-- In Supabase, if a policy on the `profiles` table calls `is_admin()`, and `is_admin()` queries the `profiles` table to check the role, it inherently risks infinite recursion regardless of language or security definer settings in newer Postgres environments.
-- 
-- SOLUTION:
-- We decouple the role check by moving the list of admin IDs into a lightweight `admin_users` table. 
-- `is_admin()` will query `admin_users` instead of `profiles`. 
-- A trigger will automatically keep `admin_users` in sync whenever `profiles.role` is updated.

-- 1. Create the lightweight lookup table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS and allow anyone to read it (safe, just UUIDs)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_users_select" ON public.admin_users;
CREATE POLICY "admin_users_select" ON public.admin_users FOR SELECT USING (true);
DROP POLICY IF EXISTS "admin_users_all_admin" ON public.admin_users;
CREATE POLICY "admin_users_all_admin" ON public.admin_users FOR ALL USING (
  EXISTS(SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid())
);

-- 2. Populate it with existing admins from profiles
INSERT INTO public.admin_users (id)
SELECT id FROM public.profiles WHERE role = 'admin'
ON CONFLICT DO NOTHING;

-- 3. Rewrite is_admin() to query the new table, breaking the recursion completely!
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.admin_users WHERE id = auth.uid()
  );
$$;

-- 4. Create trigger on profiles to keep admin_users in sync natively
CREATE OR REPLACE FUNCTION sync_admin_users()
RETURNS trigger AS $$
BEGIN
  IF NEW.role = 'admin' THEN
    INSERT INTO public.admin_users(id) VALUES(NEW.id) ON CONFLICT DO NOTHING;
  ELSE
    DELETE FROM public.admin_users WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_admin_users ON public.profiles;
CREATE TRIGGER trg_sync_admin_users
AFTER INSERT OR UPDATE OF role ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION sync_admin_users();

-- Make sure we also have the original fix for products to show correctly
DROP POLICY IF EXISTS "products_select_public_or_admin" ON public.products;
CREATE POLICY "products_select_public_or_admin" 
ON public.products 
FOR SELECT 
USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "orders_select_own_or_admin" ON public.orders;
CREATE POLICY "orders_select_own_or_admin" 
ON public.orders 
FOR SELECT 
USING (public.is_admin() OR user_id = auth.uid());
