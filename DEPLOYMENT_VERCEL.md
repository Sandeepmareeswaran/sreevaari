# Vercel Deployment Guide

## 1) Required Environment Variables

This app only needs these two frontend variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Get them from Supabase:

1. Open your Supabase project.
2. Go to Settings -> API Keys.
3. Copy one **Publishable key** (not service role key).
4. Go to Settings -> Data API (or API section) and copy Project URL.

## 2) Local Environment Setup

Create local files from examples:

- `.env` for local quick start
- `.env.development` for explicit dev setup
- `.env.production` for production test builds

Use this format:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxxxxxxxxxxx
```

## 3) Vercel Project Settings

When importing this repository to Vercel:

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

Set environment variables in Vercel:

1. Project -> Settings -> Environment Variables
2. Add `VITE_SUPABASE_URL`
3. Add `VITE_SUPABASE_ANON_KEY`
4. Apply to `Production`, `Preview`, and `Development`

## 4) SPA Routing

This repo already contains SPA rewrite config in `vercel.json`:

- All routes rewrite to `index.html`

No extra route config is needed for React Router pages.

## 5) Database and Seed Scripts

Before opening admin pages, ensure schema and categories exist:

1. Run `supabase/rebuild_schema.sql` in Supabase SQL editor.
2. Run `supabase/seed_top_categories.sql` to keep only top categories.
3. Ensure your admin user has role `admin` in `public.profiles`.

Admin promotion SQL:

```sql
update public.profiles
set role = 'admin'
where email = 'your-admin-email@example.com';
```

## 6) Verification Checklist

After deploy, verify:

1. Home page loads with no blank screen.
2. Products list loads.
3. Admin login works.
4. Admin -> Products -> Add Product shows category options.
5. Add product and save succeeds.
6. Cart and checkout can create an order.

## 7) Common Deployment Errors

### "Missing Supabase URL or key"

Cause:

- `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` not set in Vercel.

Fix:

- Add both env vars in Vercel and redeploy.

### Admin category dropdown empty

Cause:

- Categories not seeded or no permission to read categories.

Fix:

- Run `supabase/seed_top_categories.sql`.
- Ensure your logged-in user is admin.

### Build succeeds but page routes 404 on refresh

Cause:

- Missing SPA rewrite.

Fix:

- Keep `vercel.json` rewrite rule as committed in this repo.
