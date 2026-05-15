# MVR Consultants — Supabase

This folder contains Supabase project configuration, database migrations, and seed data.

All developers on the team share the **same Supabase project**, ensuring database consistency.

## Setup

1. Create a free Supabase project at [supabase.com](https://supabase.com)
2. Copy the connection strings to `backend/.env`
3. Run migrations (see below)

## Connection Details

Get from Supabase dashboard → Settings → Database:

```
# For the Rust backend (.env)
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# Using PgBouncer (transaction mode) — for production
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

## Running Migrations

**Via SQLx CLI (recommended for development):**
```bash
# Install sqlx-cli
cargo install sqlx-cli --features postgres

# Run from the backend directory
cd backend
sqlx migrate run
```

**Via Supabase Dashboard:**
- Go to SQL Editor → paste migration files in order

## Folder Structure

```
supabase/
├── migrations/     # SQL migration files (synced with backend/migrations/)
└── seed/           # Seed data for development
```

## RLS (Row Level Security)

RLS policies are managed via the Supabase dashboard. The Rust backend connects using the service role key (`DATABASE_URL`), which bypasses RLS. Frontend calls to Supabase directly (if any) use anon key with RLS enforced.
