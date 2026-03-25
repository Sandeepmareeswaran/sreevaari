-- Sree Vaari Traders
-- Fix for "Infinite recursion detected in policy for relation profiles"

-- EXPLANTION:
-- The previous `is_admin()` function was written in `LANGUAGE sql`. 
-- PostgreSQL's query planner is smart and sometimes "inlines" simple SQL functions directly into the calling query. 
-- When an inlinable function is used in an RLS policy and it queries exactly the same table, the planner inlines the function, drops the `SECURITY DEFINER` protective boundary, and evaluates the policy, creating an infinite loop.
--
-- FIX:
-- By explicitly using `LANGUAGE plpgsql`, we force the database to treat it as a black box and maintain the `SECURITY DEFINER` context, avoiding the infinite RLS loop.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean;
BEGIN
  -- We query the profiles table for the admin role as the privileged creator (postgres)
  -- Because this is plpgsql, it won't be inlined and won't trigger the RLS loop.
  SELECT (role = 'admin') INTO v_is_admin
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN coalesce(v_is_admin, false);
END;
$$;
