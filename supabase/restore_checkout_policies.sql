-- Sree Vaari Traders
-- Restore operational policies for Products and Orders

-- PRODUCTS POLICIES
DROP POLICY IF EXISTS "products_insert_admin" ON public.products;
CREATE POLICY "products_insert_admin" 
ON public.products 
FOR INSERT 
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "products_update_admin" ON public.products;
CREATE POLICY "products_update_admin" 
ON public.products 
FOR UPDATE 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "products_delete_admin" ON public.products;
CREATE POLICY "products_delete_admin" 
ON public.products 
FOR DELETE 
USING (public.is_admin());

-- ORDERS POLICIES
DROP POLICY IF EXISTS "orders_insert_checkout" ON public.orders;
CREATE POLICY "orders_insert_checkout" 
ON public.orders 
FOR INSERT 
WITH CHECK (
  public.is_admin()
  OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR (auth.uid() IS NULL AND user_id IS NULL)
);

DROP POLICY IF EXISTS "orders_update_admin" ON public.orders;
CREATE POLICY "orders_update_admin" 
ON public.orders 
FOR UPDATE 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "orders_delete_admin" ON public.orders;
CREATE POLICY "orders_delete_admin" 
ON public.orders 
FOR DELETE 
USING (public.is_admin());
