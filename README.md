# Sree Vaari Traders (React + Vite + Supabase)

E-commerce storefront and admin dashboard for coconut and by-product catalog management.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` in project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxxxxxxxxxxx
```

3. Start development server:

```bash
npm run dev
```

## Database Setup (Supabase SQL Editor)

1. Run `supabase/rebuild_schema.sql`
2. Run `supabase/seed_top_categories.sql`
3. Promote your admin user in `public.profiles`

## Deployment

See full deployment instructions in `DEPLOYMENT_VERCEL.md`.
