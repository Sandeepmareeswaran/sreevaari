-- Sree Vaari Traders
-- Supabase database rebuild script inferred from the application codebase.
-- Run this in Supabase SQL Editor.
--
-- Important:
-- 1. This recreates the structure the frontend expects.
-- 2. It cannot restore deleted business data such as products, carts, orders, or users.
-- 3. It includes optional anonymous checkout support because the current frontend allows it.

create extension if not exists pgcrypto;

-- Optional cleanup for a partially broken environment.
-- Uncomment only if you want a full reset.
-- drop table if exists public.order_items cascade;
-- drop table if exists public.orders cascade;
-- drop table if exists public.cart_items cascade;
-- drop table if exists public.carts cascade;
-- drop table if exists public.products cascade;
-- drop table if exists public.categories cascade;
-- drop table if exists public.profiles cascade;
-- drop function if exists public.handle_new_user() cascade;
-- drop function if exists public.set_updated_at() cascade;
-- drop function if exists public.is_admin() cascade;
-- drop type if exists public.order_status cascade;
-- drop type if exists public.app_role cascade;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'app_role'
      and n.nspname = 'public'
  ) then
    create type public.app_role as enum ('customer', 'admin');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'order_status'
      and n.nspname = 'public'
  ) then
    create type public.order_status as enum ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
  end if;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    phone,
    role
  )
  values (
    new.id,
    new.email,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'phone', '')), ''),
    'customer'
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        phone = coalesce(excluded.phone, public.profiles.phone);

  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  full_name text,
  phone text,
  role public.app_role not null default 'customer',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  category_id uuid not null references public.categories (id) on delete restrict,
  description text,
  price numeric(10, 2) not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  image_url text,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  user_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cart_items_cart_product_unique unique (cart_id, product_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  total_amount numeric(10, 2) not null check (total_amount >= 0),
  status public.order_status not null default 'pending',
  shipping_address jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  quantity integer not null check (quantity > 0),
  price_at_purchase numeric(10, 2) not null check (price_at_purchase >= 0),
  created_at timestamptz not null default now()
);

-- Repair partially existing tables created by earlier/manual attempts.
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists role public.app_role default 'customer';
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists created_at timestamptz default now();
alter table public.profiles add column if not exists updated_at timestamptz default now();

alter table public.categories add column if not exists name text;
alter table public.categories add column if not exists slug text;
alter table public.categories add column if not exists description text;
alter table public.categories add column if not exists created_at timestamptz default now();
alter table public.categories add column if not exists updated_at timestamptz default now();

update public.categories
set slug = lower(regexp_replace(trim(name), '\\s+', '-', 'g'))
where slug is null
  and name is not null;

with ranked as (
  select id, slug, row_number() over (partition by slug order by created_at nulls last, id) as rn
  from public.categories
  where slug is not null
)
update public.categories c
set slug = c.slug || '-' || substr(c.id::text, 1, 8)
from ranked r
where c.id = r.id
  and r.rn > 1;

alter table public.products add column if not exists name text;
alter table public.products add column if not exists slug text;
alter table public.products add column if not exists category_id uuid;
alter table public.products add column if not exists description text;
alter table public.products add column if not exists price numeric(10, 2) default 0;
alter table public.products add column if not exists stock integer default 0;
alter table public.products add column if not exists image_url text;
alter table public.products add column if not exists is_featured boolean default false;
alter table public.products add column if not exists is_active boolean default true;
alter table public.products add column if not exists created_at timestamptz default now();
alter table public.products add column if not exists updated_at timestamptz default now();

alter table public.carts add column if not exists user_id uuid;
alter table public.carts add column if not exists user_email text;
alter table public.carts add column if not exists created_at timestamptz default now();
alter table public.carts add column if not exists updated_at timestamptz default now();

alter table public.cart_items add column if not exists cart_id uuid;
alter table public.cart_items add column if not exists product_id uuid;
alter table public.cart_items add column if not exists quantity integer default 1;
alter table public.cart_items add column if not exists created_at timestamptz default now();
alter table public.cart_items add column if not exists updated_at timestamptz default now();

alter table public.orders add column if not exists user_id uuid;
alter table public.orders add column if not exists total_amount numeric(10, 2) default 0;
alter table public.orders add column if not exists status public.order_status default 'pending';
alter table public.orders add column if not exists shipping_address jsonb default '{}'::jsonb;
alter table public.orders add column if not exists created_at timestamptz default now();
alter table public.orders add column if not exists updated_at timestamptz default now();

alter table public.order_items add column if not exists order_id uuid;
alter table public.order_items add column if not exists product_id uuid;
alter table public.order_items add column if not exists quantity integer default 1;
alter table public.order_items add column if not exists price_at_purchase numeric(10, 2) default 0;
alter table public.order_items add column if not exists created_at timestamptz default now();

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists categories_slug_idx on public.categories (slug);
create unique index if not exists categories_slug_unique_idx on public.categories (slug);
create index if not exists products_category_id_idx on public.products (category_id);
create index if not exists products_is_featured_idx on public.products (is_featured);
create index if not exists products_is_active_idx on public.products (is_active);
create index if not exists carts_user_id_idx on public.carts (user_id);
create index if not exists cart_items_cart_id_idx on public.cart_items (cart_id);
create index if not exists cart_items_product_id_idx on public.cart_items (product_id);
create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists order_items_product_id_idx on public.order_items (product_id);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at
before update on public.categories
for each row
execute function public.set_updated_at();

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

drop trigger if exists set_carts_updated_at on public.carts;
create trigger set_carts_updated_at
before update on public.carts
for each row
execute function public.set_updated_at();

drop trigger if exists set_cart_items_updated_at on public.cart_items;
create trigger set_cart_items_updated_at
before update on public.cart_items
for each row
execute function public.set_updated_at();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
on public.profiles
for select
using (public.is_admin());

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin"
on public.profiles
for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "categories_select_public" on public.categories;
create policy "categories_select_public"
on public.categories
for select
using (true);

drop policy if exists "categories_insert_admin" on public.categories;
create policy "categories_insert_admin"
on public.categories
for insert
with check (public.is_admin());

drop policy if exists "categories_update_admin" on public.categories;
create policy "categories_update_admin"
on public.categories
for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "categories_delete_admin" on public.categories;
create policy "categories_delete_admin"
on public.categories
for delete
using (public.is_admin());

drop policy if exists "products_select_public_or_admin" on public.products;
create policy "products_select_public_or_admin"
on public.products
for select
using (is_active = true or public.is_admin());

drop policy if exists "products_insert_admin" on public.products;
create policy "products_insert_admin"
on public.products
for insert
with check (public.is_admin());

drop policy if exists "products_update_admin" on public.products;
create policy "products_update_admin"
on public.products
for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "products_delete_admin" on public.products;
create policy "products_delete_admin"
on public.products
for delete
using (public.is_admin());

drop policy if exists "carts_select_own" on public.carts;
create policy "carts_select_own"
on public.carts
for select
using (auth.uid() = user_id);

drop policy if exists "carts_insert_own" on public.carts;
create policy "carts_insert_own"
on public.carts
for insert
with check (auth.uid() = user_id);

drop policy if exists "carts_update_own" on public.carts;
create policy "carts_update_own"
on public.carts
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "carts_delete_own" on public.carts;
create policy "carts_delete_own"
on public.carts
for delete
using (auth.uid() = user_id);

drop policy if exists "cart_items_select_own" on public.cart_items;
create policy "cart_items_select_own"
on public.cart_items
for select
using (
  exists (
    select 1
    from public.carts c
    where c.id = cart_items.cart_id
      and c.user_id = auth.uid()
  )
);

drop policy if exists "cart_items_insert_own" on public.cart_items;
create policy "cart_items_insert_own"
on public.cart_items
for insert
with check (
  exists (
    select 1
    from public.carts c
    where c.id = cart_items.cart_id
      and c.user_id = auth.uid()
  )
);

drop policy if exists "cart_items_update_own" on public.cart_items;
create policy "cart_items_update_own"
on public.cart_items
for update
using (
  exists (
    select 1
    from public.carts c
    where c.id = cart_items.cart_id
      and c.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.carts c
    where c.id = cart_items.cart_id
      and c.user_id = auth.uid()
  )
);

drop policy if exists "cart_items_delete_own" on public.cart_items;
create policy "cart_items_delete_own"
on public.cart_items
for delete
using (
  exists (
    select 1
    from public.carts c
    where c.id = cart_items.cart_id
      and c.user_id = auth.uid()
  )
);

drop policy if exists "orders_select_own_or_admin" on public.orders;
create policy "orders_select_own_or_admin"
on public.orders
for select
using (public.is_admin() or user_id = auth.uid());

drop policy if exists "orders_insert_checkout" on public.orders;
create policy "orders_insert_checkout"
on public.orders
for insert
with check (
  public.is_admin()
  or (auth.uid() is not null and user_id = auth.uid())
  or (auth.uid() is null and user_id is null)
);

drop policy if exists "orders_update_admin" on public.orders;
create policy "orders_update_admin"
on public.orders
for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "orders_delete_admin" on public.orders;
create policy "orders_delete_admin"
on public.orders
for delete
using (public.is_admin());

drop policy if exists "order_items_select_own_or_admin" on public.order_items;
create policy "order_items_select_own_or_admin"
on public.order_items
for select
using (
  public.is_admin()
  or exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and o.user_id = auth.uid()
  )
);

drop policy if exists "order_items_insert_checkout" on public.order_items;
create policy "order_items_insert_checkout"
on public.order_items
for insert
with check (
  public.is_admin()
  or exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and (
        (auth.uid() is not null and o.user_id = auth.uid())
        or (auth.uid() is null and o.user_id is null)
      )
  )
);

drop policy if exists "order_items_update_admin" on public.order_items;
create policy "order_items_update_admin"
on public.order_items
for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "order_items_delete_admin" on public.order_items;
create policy "order_items_delete_admin"
on public.order_items
for delete
using (public.is_admin());

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

insert into public.categories (name, slug, description)
values
  ('Raw Coconuts', 'raw-coconuts', 'Fresh whole coconuts for daily use.'),
  ('Tender Coconuts', 'tender-coconuts', 'Young green coconuts for drinking and fresh consumption.'),
  ('Semi Husked Coconuts', 'semi-husked-coconuts', 'Semi husked coconuts for wholesale and retail supply.'),
  ('Copra', 'copra', 'Dried coconut kernels used for oil extraction and trade.'),
  ('Coconut Oil', 'coconut-oil', 'Traditional and virgin coconut oil products.'),
  ('Virgin Coconut Oil', 'virgin-coconut-oil', 'Premium cold-processed virgin coconut oil.'),
  ('Coconut Milk', 'coconut-milk', 'Fresh and processed coconut milk products.'),
  ('Coconut Cream', 'coconut-cream', 'Thick coconut cream for cooking and food production.'),
  ('Desiccated Coconut', 'desiccated-coconut', 'Finely shredded and dried coconut products.'),
  ('Coconut Powder', 'coconut-powder', 'Powdered coconut products for food and industrial use.'),
  ('Coconut Flour', 'coconut-flour', 'Gluten-free flour made from coconut solids.'),
  ('Coconut Sugar', 'coconut-sugar', 'Natural sweetener derived from coconut palm sap.'),
  ('Coconut Shell Products', 'coconut-shell-products', 'Bowls, cups, ladles, and shell-based utility products.'),
  ('Coconut Charcoal', 'coconut-charcoal', 'Shell charcoal and activated carbon raw material.'),
  ('Coconut Fiber', 'coconut-fiber', 'Natural coconut fiber for ropes, brushes, and industrial use.'),
  ('Coir Products', 'coir-products', 'Coir ropes, mats, pith, and related by-products.'),
  ('Coir Pith', 'coir-pith', 'Coir pith blocks and grow media products.'),
  ('Coconut Crafts', 'coconut-crafts', 'Decorative and handcrafted coconut-based products.')
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    updated_at = now();

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'orders'
    ) then
      alter publication supabase_realtime add table public.orders;
    end if;

    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'products'
    ) then
      alter publication supabase_realtime add table public.products;
    end if;
  end if;
end $$;

comment on table public.profiles is 'Public profile mirror for auth.users, used for admin/customer views and role checks.';
comment on table public.categories is 'Product categories shown in storefront filters.';
comment on table public.products is 'Sellable items for the storefront and admin inventory management.';
comment on table public.carts is 'One cart per authenticated user.';
comment on table public.cart_items is 'Line items belonging to a user cart.';
comment on table public.orders is 'Checkout orders created from direct purchase or cart checkout.';
comment on table public.order_items is 'Order line items with historical purchase price.';

-- Promote an existing user to admin after signup:
-- update public.profiles
-- set role = 'admin'
-- where email = 'your-admin-email@example.com';
