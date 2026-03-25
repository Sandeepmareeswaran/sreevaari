-- Create Admin User and Identity forcefully
-- This is a complete script that manually hacks Auth to accept this user

DO $$
DECLARE
  new_admin_id uuid := uuid_generate_v4();
BEGIN
  -- 1. Insert into auth.users 
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
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_admin_id,
    'authenticated',
    'authenticated',
    'admin@gmail.com',
    crypt('admin', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Store Admin"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  -- 2. Insert into auth.identities so the Login API accepts them!
  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    created_at,
    updated_at
  ) VALUES (
    uuid_generate_v4(),
    new_admin_id,
    new_admin_id::text, -- Provider ID is the UUID as string for email
    jsonb_build_object('sub', new_admin_id, 'email', 'admin@gmail.com'),
    'email',
    now(),
    now()
  );

  -- 3. The trigger auto-creates a profile with role = 'customer'. 
  -- We wait a millisecond, then forcefully upgrade it to 'admin'.
  UPDATE public.profiles
  SET 
    role = 'admin',
    full_name = 'Store Admin'
  WHERE id = new_admin_id;

  -- 4. Map the admin securely into our new lookup table for policies
  INSERT INTO public.admin_users (id) 
  VALUES (new_admin_id) 
  ON CONFLICT DO NOTHING;

END $$;
