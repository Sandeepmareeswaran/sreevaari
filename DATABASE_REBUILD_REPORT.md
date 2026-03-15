# Supabase Database Reconstruction Report

## Scope

This report reconstructs the deleted Supabase database structure from the frontend codebase. It is based on actual table, column, join, and policy expectations found in the React application.

It covers:

- Required tables
- Required columns
- Foreign-key relationships
- Indexes
- Auth/profile integration
- Row Level Security expectations
- Seed data required by the storefront

It does not recover deleted data. If your original product records, carts, orders, or users were deleted, this rebuild only restores the schema and baseline category structure.

## Required Tables

### profiles

Purpose:

- Stores public user profile data mirrored from `auth.users`
- Provides `role` for admin access checks
- Powers the admin customer list and dashboard user count

Required columns:

- `id uuid primary key` linked to `auth.users.id`
- `email text`
- `full_name text`
- `phone text`
- `role app_role`
- `avatar_url text` optional
- `created_at timestamptz`
- `updated_at timestamptz`

Frontend dependencies:

- signup metadata uses `full_name` and `phone`
- admin customers page reads `full_name`, `role`, and `created_at`
- admin dashboard counts rows in `profiles`

### categories

Purpose:

- Drives storefront category filtering and product categorization

Required columns:

- `id uuid primary key`
- `name text`
- `slug text`
- `description text` optional
- `created_at timestamptz`
- `updated_at timestamptz`

Frontend dependencies:

- product listing reads `id`, `name`, `slug`
- product relations use `category:categories(name, slug)`

### products

Purpose:

- Main inventory table for storefront and admin CRUD

Required columns:

- `id uuid primary key`
- `name text`
- `slug text` optional but useful
- `category_id uuid not null`
- `description text`
- `price numeric(10,2)`
- `stock integer`
- `image_url text`
- `is_featured boolean`
- `is_active boolean`
- `created_at timestamptz`
- `updated_at timestamptz`

Frontend dependencies:

- home reads featured products by `is_featured`
- listing/detail/cart/orders/admin rely on `name`, `price`, `stock`, `image_url`, `description`, `category_id`
- admin product creation sets `is_active = true`

### carts

Purpose:

- Stores one cart per authenticated user

Required columns:

- `id uuid primary key`
- `user_id uuid unique not null`
- `user_email text`
- `created_at timestamptz`
- `updated_at timestamptz`

Frontend dependencies:

- cart context fetches by `user_id`
- cart context backfills `user_email`

### cart_items

Purpose:

- Stores cart line items

Required columns:

- `id uuid primary key`
- `cart_id uuid not null`
- `product_id uuid not null`
- `quantity integer`
- `created_at timestamptz`
- `updated_at timestamptz`

Frontend dependencies:

- cart context joins `product:products(*)`
- add/update/remove cart operations rely on `cart_id`, `product_id`, `quantity`

### orders

Purpose:

- Stores order headers created during checkout

Required columns:

- `id uuid primary key`
- `user_id uuid nullable`
- `total_amount numeric(10,2)`
- `status order_status`
- `shipping_address jsonb`
- `created_at timestamptz`
- `updated_at timestamptz`

Frontend dependencies:

- checkout inserts `user_id`, `total_amount`, `status`, `shipping_address`
- orders page reads `created_at`, `status`, `total_amount`, `shipping_address`
- admin dashboard and admin orders read counts, status, totals, and recent records

### order_items

Purpose:

- Stores order line items with historical price snapshots

Required columns:

- `id uuid primary key`
- `order_id uuid not null`
- `product_id uuid nullable`
- `quantity integer`
- `price_at_purchase numeric(10,2)`
- `created_at timestamptz`

Frontend dependencies:

- checkout inserts `order_id`, `product_id`, `quantity`, `price_at_purchase`
- orders page joins `product:products(name, image_url)` and reads `quantity`, `price_at_purchase`

## Relationship Map

- `profiles.id -> auth.users.id`
- `products.category_id -> categories.id`
- `carts.user_id -> auth.users.id`
- `cart_items.cart_id -> carts.id`
- `cart_items.product_id -> products.id`
- `orders.user_id -> auth.users.id`
- `order_items.order_id -> orders.id`
- `order_items.product_id -> products.id`

## Required Enums

### app_role

Values:

- `customer`
- `admin`

### order_status

Values:

- `pending`
- `processing`
- `shipped`
- `delivered`
- `cancelled`

These exact status strings are required because the frontend compares them directly.

## Auth and Trigger Integration

The app signs up users through Supabase Auth and stores extra metadata in `raw_user_meta_data`.

To preserve that flow, the rebuild script creates:

- a `handle_new_user()` trigger function
- an `after insert` trigger on `auth.users`

That trigger mirrors:

- `email`
- `full_name`
- `phone`

into `public.profiles`.

## Row Level Security Model

The SQL rebuild includes RLS because this app performs all database access directly from the frontend.

### Public access

- public users can read categories
- public users can read active products
- anonymous users can create orders and order_items only if the order is anonymous

### Authenticated user access

- users can read and update their own profile
- users can manage only their own cart and cart items
- users can read only their own orders and order items
- authenticated checkout can create orders using their own `user_id`

### Admin access

- admins can read all profiles
- admins can create, update, and delete categories and products
- admins can read and update all orders and order items

This model matches the current frontend behavior while still limiting normal users.

## Realtime Requirements

The admin dashboard subscribes to realtime changes for:

- `public.orders`
- `public.products`

The rebuild script adds both tables to the `supabase_realtime` publication if it exists.

## Seed Data Included

The storefront links use category slugs directly in URLs, so the rebuild script seeds these categories:

- `raw-coconuts`
- `coconut-oil`
- `coir-products`

Without these slugs, the homepage category links and product filter behavior will not line up cleanly with the UI.

## Important Behavior Caveat

The current frontend supports anonymous checkout in `CheckoutModal.jsx` by inserting `user_id = null` when the user is not logged in.

Because of that, the rebuild SQL keeps `orders.user_id` nullable and allows anonymous insert policies.

If you want stricter security later, change the app so checkout requires login, then tighten the RLS policy and make `orders.user_id` mandatory.

## Files Created

- `supabase/rebuild_schema.sql`: run this in Supabase SQL Editor
- `DATABASE_REBUILD_REPORT.md`: this analysis document

## Recommended Restore Sequence

1. Run `supabase/rebuild_schema.sql` in Supabase SQL Editor.
2. Create or confirm your frontend env vars for `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Sign up one admin user.
4. Promote that user manually in `public.profiles` by changing `role` to `admin`.
5. Recreate product rows from backup or admin UI.
6. Test signup, login, product listing, add to cart, checkout, orders, and admin CRUD.

## Final Assessment

The reconstructed schema is sufficient for the current app to run again structurally. The most important missing part after running it will be actual business data, especially products. The schema is code-driven and should match the application more closely than a generic ecommerce template schema.