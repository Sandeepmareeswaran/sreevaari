-- Sree Vaari Traders
-- SQL Fix for RLS Policies

-- Fix 1: "Best Selling Products" missing for logged-in users.
-- The previous policy didn't clearly distinguish or grant access correctly to both anon and authenticated users 
-- in all scenarios where `public.is_admin()` evaluates. We explicitly grant SELECT to all roles for active products.

DROP POLICY IF EXISTS "products_select_public_or_admin" ON public.products;

CREATE POLICY "products_select_public_or_admin" 
ON public.products 
FOR SELECT 
USING (is_active = true OR public.is_admin());

-- Fix 2: Orders visibility in Admin dashboard.
-- Ensuring that the orders SELECT policy correctly authenticates admins.
-- If you are not seeing orders in the Admin dashboard, you MUST ensure your user account has the 'admin' role.

DROP POLICY IF EXISTS "orders_select_own_or_admin" ON public.orders;

CREATE POLICY "orders_select_own_or_admin" 
ON public.orders 
FOR SELECT 
USING (public.is_admin() OR user_id = auth.uid());

-- IMPORTANT: Admin role promotion
-- Run this query to make sure your email is set as an admin!
-- Replace 'your-email@example.com' with the email you signed up with.
/*
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
*/
