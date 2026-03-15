-- Keep only top-level categories for product management.
-- This script is safe even if extra categories already exist.

-- 1) Ensure required table columns exist.
alter table public.categories add column if not exists name text;
alter table public.categories add column if not exists slug text;
alter table public.categories add column if not exists description text;
alter table public.categories add column if not exists updated_at timestamptz default now();

create unique index if not exists categories_slug_unique_idx on public.categories (slug);

-- 2) Upsert only top categories.
insert into public.categories (name, slug, description)
values
  ('Raw Coconuts', 'raw-coconuts', 'Whole coconuts and related raw coconut variants.'),
  ('Coconut Oil', 'coconut-oil', 'All coconut oil products including virgin and cold-pressed variants.'),
  ('Coconut Food Products', 'coconut-food-products', 'Coconut milk, cream, flour, powder, and desiccated coconut.'),
  ('Coir & Fiber Products', 'coir-fiber-products', 'Coir pith, coir rope, mats, fiber, and related products.'),
  ('Coconut Shell & Crafts', 'coconut-shell-crafts', 'Shell products, charcoal, handicrafts, and value-added shell items.')
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    updated_at = now();

-- 3) Remap products from old categories into top-level categories (if products exist).
with top as (
  select id, slug from public.categories
  where slug in ('raw-coconuts', 'coconut-oil', 'coconut-food-products', 'coir-fiber-products', 'coconut-shell-crafts')
),
map as (
  select
    c.id as old_category_id,
    case
      when c.slug in ('tender-coconuts', 'semi-husked-coconuts', 'copra', 'raw-coconuts') then 'raw-coconuts'
      when c.slug in ('coconut-oil', 'virgin-coconut-oil') then 'coconut-oil'
      when c.slug in ('coconut-milk', 'coconut-cream', 'desiccated-coconut', 'coconut-powder', 'coconut-flour', 'coconut-sugar') then 'coconut-food-products'
      when c.slug in ('coir-products', 'coir-pith', 'coconut-fiber') then 'coir-fiber-products'
      when c.slug in ('coconut-shell-products', 'coconut-charcoal', 'coconut-crafts') then 'coconut-shell-crafts'
      else 'raw-coconuts'
    end as new_slug
  from public.categories c
),
resolved as (
  select m.old_category_id, t.id as new_category_id
  from map m
  join top t on t.slug = m.new_slug
)
update public.products p
set category_id = r.new_category_id
from resolved r
where p.category_id = r.old_category_id
  and p.category_id <> r.new_category_id;

-- 4) Remove all categories except the top set.
delete from public.categories
where slug not in (
  'raw-coconuts',
  'coconut-oil',
  'coconut-food-products',
  'coir-fiber-products',
  'coconut-shell-crafts'
);

-- 5) Verify final categories.
select id, name, slug
from public.categories
order by name;