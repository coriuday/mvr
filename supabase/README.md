# MVR Consultants — Supabase Database

This folder contains the Supabase database **reset script** for the shared development database.

All developers on the team share the **same Supabase project** (`vjjykfkbfkfalhqkczsd`), ensuring database consistency.

---

## ⚠️ Database Reset (Full Reset + Re-seed)

Use this when the database is in a broken/inconsistent state or when starting fresh.

### `reset_and_seed.sql`

This script:
1. **Drops** all tables, triggers, and ENUM types (complete wipe)
2. **Drops** the `_sqlx_migrations` tracking table (so the Rust backend will re-apply all migrations)
3. **Recreates** the full schema (consolidates all 10 migration files)
4. **Seeds** an admin user

**How to run it:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/vjjykfkbfkfalhqkczsd)
2. Navigate to **SQL Editor**
3. Paste the contents of `supabase/reset_and_seed.sql`
4. Click **Run**
5. Restart the backend — it will re-apply all migrations automatically

**Seeded Admin Credentials:**
```
Email:    mvrconsultantshyd@gmail.com
Password: Admin@MVR2025!
```
> **Change the admin password immediately** after first login via the admin panel.

---

## Normal Development (No Reset Needed)

The Rust backend automatically applies migrations on startup via SQLx.

Simply make sure your `DATABASE_URL` in `.env` (root or `backend/.env`) points to the correct Supabase project.

---

## Connection Details

Get the connection string from: **Supabase Dashboard → Project Settings → Database → Connection string**

```
# Transaction pooler (used in production and Docker dev)
DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-<region>.pooler.supabase.com:5432/postgres
```

---

## Folder Structure

```
supabase/
├── reset_and_seed.sql   # Full DB reset + schema + seed admin user
└── README.md            # This file
```

---

## Migrations

Migrations live in `backend/migrations/` and are automatically applied by the Rust backend on startup. They are numbered `20250101000001` through `20250101000010`.

| # | File | Description |
|---|------|-------------|
| 1 | `create_users.sql` | User accounts + roles enum |
| 2 | `create_leads.sql` | Lead management |
| 3 | `create_blogs.sql` | Blog posts |
| 4 | `create_universities.sql` | University listings |
| 5 | `create_testimonials.sql` | Student testimonials |
| 6 | `create_scholarships.sql` | Scholarship listings |
| 7 | `create_countries.sql` | Country pages (JSONB content) |
| 8 | `create_newsletter_subscribers.sql` | Email subscribers |
| 9 | `add_blog_category_readtime.sql` | Blog category + read time |
| 10 | `fix_scholarships_missing_columns.sql` | Scholarship columns fix |
