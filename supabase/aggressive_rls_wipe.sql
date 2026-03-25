-- Aggressive RLS Wipe and Replace
-- This script completely deletes ALL existing policies on the `profiles` table 
-- that might be secretly causing your infinite recursion.

-- 1. Drop ALL policies on profiles
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', r.policyname);
    END LOOP;
END $$;

-- 2. We skip dropping is_admin since CREATE OR REPLACE will overwrite it safely
-- DROP FUNCTION IF EXISTS public.is_admin();

-- 3. We will do the Admin lookup via the JWT or bypassing RLS.
-- Supabase best practice for "infinite recursion" in profiles without a secondary table:
-- We can just allow users to SELECT their own profile, and admins bypass RLS via the Service_Role in backend.
-- BUT if the frontend admin dashboard needs to read all profiles, we can use a completely secure SECURITY DEFINER function to bypass RLS for exactly that query, rather than an RLS policy!

-- Create the NEW is_admin() using JWT claims if possible, 
-- or we use the admin_users table approach again but making SURE we completely wiped the old policies!

---- Let's use the admin_users table approach safely ----
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

INSERT INTO public.admin_users (id)
SELECT id FROM public.profiles WHERE role = 'admin'
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.admin_users WHERE id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.sync_admin_users()
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
EXECUTE FUNCTION public.sync_admin_users();

-- 4. Recreate ONLY safe policies on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Allow admins to also select all profiles safely
CREATE POLICY "profiles_select_admin" 
ON public.profiles 
FOR SELECT 
USING (public.is_admin());

-- Allow users to update their own profile
CREATE POLICY "profiles_update_own" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Allow admins to update all profiles
CREATE POLICY "profiles_update_admin" 
ON public.profiles 
FOR UPDATE 
USING (public.is_admin());

-- 5. Fix Products and Orders
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'products' AND schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.products', r.policyname);
    END LOOP;
END $$;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_select_public_or_admin" 
ON public.products 
FOR SELECT 
USING (is_active = true OR public.is_admin());

DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'orders' AND schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.orders', r.policyname);
    END LOOP;
END $$;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_select_own_or_admin" 
ON public.orders 
FOR SELECT 
USING (public.is_admin() OR user_id = auth.uid());
