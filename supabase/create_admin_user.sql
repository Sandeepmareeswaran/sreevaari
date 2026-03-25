-- Sree Vaari Traders
-- Create Admin User Direct SQL Script

-- 1. We create the user in Supabase auth.users
-- This handles password encryption natively
DO $$
DECLARE
  new_admin_id uuid := uuid_generate_v4();
BEGIN
  -- Insert into auth system
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_admin_id,
    'authenticated',
    'authenticated',
    'admin@gmail.com',
    crypt('admin', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Store Admin", "phone": ""}',
    now(),
    now()
  );

  -- 2. Give the trigger a moment to create the profile row,
  -- then force their role to "admin" in public.profiles
  UPDATE public.profiles
  SET 
    role = 'admin',
    full_name = 'Store Admin'
  WHERE id = new_admin_id;

  -- 3. We also need to insert them into our new admin_users lookup table 
  -- since we decoupled the policies earlier! (The trigger will usually handle this, but explicit is safe)
  INSERT INTO public.admin_users (id) 
  VALUES (new_admin_id) 
  ON CONFLICT DO NOTHING;

END $$;
