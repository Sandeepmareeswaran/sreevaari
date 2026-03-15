-- Repair categories table shape for partially-migrated databases.
alter table public.categories add column if not exists name text;
alter table public.categories add column if not exists slug text;
alter table public.categories add column if not exists description text;
alter table public.categories add column if not exists created_at timestamptz default now();
alter table public.categories add column if not exists updated_at timestamptz default now();

-- Ensure existing rows have slugs so upsert conflict target works.
update public.categories
set slug = lower(regexp_replace(trim(name), '\s+', '-', 'g'))
where slug is null
  and name is not null;

-- If duplicate slugs exist from old data, make them unique before adding unique index.
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

create unique index if not exists categories_slug_unique_idx on public.categories (slug);

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