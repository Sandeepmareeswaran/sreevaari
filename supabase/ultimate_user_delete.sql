-- Sree Vaari Traders
-- Ultimate User Deletion Script
-- This script safely removes the broken user from every single table they might be attached to, preventing any Foreign Key constraint errors.

DO $$
DECLARE 
  bad_uid uuid;
BEGIN
  -- Grab the broken user ID
  SELECT id INTO bad_uid FROM auth.users WHERE email = 'admin@gmail.com';
  
  IF bad_uid IS NOT NULL THEN
    
    -- 1. Delete order items for their orders, then orders
    DELETE FROM public.order_items WHERE order_id IN (SELECT id FROM public.orders WHERE user_id = bad_uid);
    DELETE FROM public.orders WHERE user_id = bad_uid;
    
    -- 2. Delete cart items, then the cart
    DELETE FROM public.cart_items WHERE cart_id IN (SELECT id FROM public.carts WHERE user_id = bad_uid);
    DELETE FROM public.carts WHERE user_id = bad_uid;
    
    -- 3. Delete admin lookup and profile
    DELETE FROM public.admin_users WHERE id = bad_uid;
    DELETE FROM public.profiles WHERE id = bad_uid;
    
    -- 4. Delete the auth mapping
    DELETE FROM auth.identities WHERE user_id = bad_uid;
    
    -- 5. Finally, annihilate the user itself!
    DELETE FROM auth.users WHERE id = bad_uid;
    
  END IF;
END $$;
