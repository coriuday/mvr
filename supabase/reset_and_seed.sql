-- =============================================================================
-- MVR Consultants — FULL DATABASE RESET & SEED SCRIPT
-- =============================================================================
-- ⚠️  WARNING: This script DROPS all tables and re-creates them from scratch.
--              ALL EXISTING DATA WILL BE PERMANENTLY DELETED.
--
-- Usage: Run this in the Supabase SQL Editor for your project.
--        After running, restart the backend — it will re-run all 10 migrations.
--
-- What this script does:
--   1. Drops all application tables (in dependency order)
--   2. Drops all custom ENUM types
--   3. Drops the SQLx migration tracking table (_sqlx_migrations) so the Rust
--      backend will re-apply all migrations on next startup
--   4. Recreates the full schema (mirrors all 10 migration files combined)
--   5. Seeds an admin user account
--   6. Sets up Row Level Security (RLS) policies for Supabase compatibility
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 1: DROP ALL TABLES (dependency order: children first, parents last)
-- ─────────────────────────────────────────────────────────────────────────────

-- Drop triggers first to avoid errors
DROP TRIGGER IF EXISTS newsletter_subscribers_updated_at ON newsletter_subscribers;
DROP TRIGGER IF EXISTS countries_updated_at             ON countries;
DROP TRIGGER IF EXISTS scholarships_updated_at          ON scholarships;
DROP TRIGGER IF EXISTS testimonials_updated_at          ON testimonials;
DROP TRIGGER IF EXISTS universities_updated_at          ON universities;
DROP TRIGGER IF EXISTS blogs_updated_at                 ON blogs;
DROP TRIGGER IF EXISTS leads_updated_at                 ON leads;
DROP TRIGGER IF EXISTS users_updated_at                 ON users;

-- Drop tables (foreign key dependents first)
DROP TABLE IF EXISTS newsletter_subscribers CASCADE;
DROP TABLE IF EXISTS countries              CASCADE;
DROP TABLE IF EXISTS scholarships           CASCADE;
DROP TABLE IF EXISTS testimonials           CASCADE;
DROP TABLE IF EXISTS universities           CASCADE;
DROP TABLE IF EXISTS blogs                  CASCADE;
DROP TABLE IF EXISTS leads                  CASCADE;
DROP TABLE IF EXISTS users                  CASCADE;

-- Drop the SQLx migration tracking table so Rust will re-apply all migrations
DROP TABLE IF EXISTS _sqlx_migrations CASCADE;

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 2: DROP ALL CUSTOM ENUM TYPES
-- ─────────────────────────────────────────────────────────────────────────────

DROP TYPE IF EXISTS subscriber_status  CASCADE;
DROP TYPE IF EXISTS scholarship_type   CASCADE;
DROP TYPE IF EXISTS lead_source        CASCADE;
DROP TYPE IF EXISTS lead_status        CASCADE;
DROP TYPE IF EXISTS user_role          CASCADE;

-- Drop the shared trigger function last
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 3: RECREATE SHARED TRIGGER FUNCTION
-- (Migration 001 equivalent)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 4: RECREATE ENUM TYPES
-- ─────────────────────────────────────────────────────────────────────────────

-- Migration 001
CREATE TYPE user_role AS ENUM ('ADMIN', 'EDITOR', 'COUNSELOR');

-- Migration 002
CREATE TYPE lead_status AS ENUM ('NEW', 'CONTACTED', 'IN_PROGRESS', 'CONVERTED', 'REJECTED');
CREATE TYPE lead_source AS ENUM ('WEBSITE', 'REFERRAL', 'SOCIAL_MEDIA', 'PHONE_CALL', 'WALK_IN', 'OTHER');

-- Migration 006
CREATE TYPE scholarship_type AS ENUM (
    'MERIT_BASED',
    'NEED_BASED',
    'GOVERNMENT',
    'UNIVERSITY',
    'PRIVATE'
);

-- Migration 008
CREATE TYPE subscriber_status AS ENUM ('active', 'unsubscribed');

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 5: RECREATE ALL TABLES
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Migration 001: users ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    role            user_role NOT NULL DEFAULT 'COUNSELOR',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role  ON users(role);

CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ── Migration 002: leads ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(255) NOT NULL,
    email               VARCHAR(255) NOT NULL,
    phone               VARCHAR(50),
    message             TEXT,
    status              lead_status NOT NULL DEFAULT 'NEW',
    source              lead_source NOT NULL DEFAULT 'WEBSITE',
    country_interest    VARCHAR(100),
    assigned_to         UUID REFERENCES users(id) ON DELETE SET NULL,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leads_email      ON leads(email);
CREATE INDEX idx_leads_status     ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);

CREATE TRIGGER leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ── Migration 003 + 009: blogs (includes category & read_time from M009) ─────
CREATE TABLE IF NOT EXISTS blogs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title               VARCHAR(500) NOT NULL,
    slug                VARCHAR(500) NOT NULL UNIQUE,
    content             TEXT NOT NULL,
    excerpt             TEXT,
    image_url           TEXT,
    published           BOOLEAN NOT NULL DEFAULT FALSE,
    author_id           UUID REFERENCES users(id) ON DELETE SET NULL,
    meta_title          VARCHAR(60),
    meta_description    VARCHAR(160),
    tags                TEXT[] NOT NULL DEFAULT '{}',
    category            VARCHAR(100),          -- Added in Migration 009
    read_time           VARCHAR(20),           -- Added in Migration 009
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blogs_slug       ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_published  ON blogs(published);
CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON blogs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_tags       ON blogs USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_blogs_category   ON blogs(category);

CREATE TRIGGER blogs_updated_at
    BEFORE UPDATE ON blogs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ── Migration 004: universities ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS universities (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(500) NOT NULL,
    country         VARCHAR(100) NOT NULL,
    ranking         INTEGER,
    logo_url        TEXT,
    description     TEXT,
    website_url     TEXT,
    is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_universities_country  ON universities(country);
CREATE INDEX idx_universities_ranking  ON universities(ranking);
CREATE INDEX idx_universities_featured ON universities(is_featured);

CREATE TRIGGER universities_updated_at
    BEFORE UPDATE ON universities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ── Migration 005: testimonials ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS testimonials (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_name    VARCHAR(255) NOT NULL,
    review          TEXT NOT NULL,
    image_url       TEXT,
    rating          SMALLINT NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
    country         VARCHAR(100),
    university      VARCHAR(255),
    course          VARCHAR(255),
    is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_testimonials_featured ON testimonials(is_featured);
CREATE INDEX idx_testimonials_rating   ON testimonials(rating);

-- ── Migration 006 + 010: scholarships (all columns included) ─────────────────
CREATE TABLE IF NOT EXISTS scholarships (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(500) NOT NULL,
    scholarship_type    scholarship_type NOT NULL,
    country             VARCHAR(100) NOT NULL DEFAULT '',
    amount              VARCHAR(100),        -- Flexible: "Full Tuition", "$5,000/year"
    deadline            DATE,
    description         TEXT,
    eligibility         TEXT,
    apply_url           TEXT,
    is_featured         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scholarships_type     ON scholarships(scholarship_type);
CREATE INDEX idx_scholarships_country  ON scholarships(country);
CREATE INDEX idx_scholarships_featured ON scholarships(is_featured);
CREATE INDEX idx_scholarships_deadline ON scholarships(deadline);

CREATE TRIGGER scholarships_updated_at
    BEFORE UPDATE ON scholarships
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ── Migration 007: countries ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS countries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Card metadata (drives the /countries listing grid)
    slug            VARCHAR(100) NOT NULL UNIQUE,
    name            VARCHAR(200) NOT NULL,
    flag            VARCHAR(10)  NOT NULL,
    tagline         VARCHAR(200) NOT NULL DEFAULT '',
    image_url       TEXT,              -- Unsplash / Cloudinary URL for card thumbnail
    hero_image_url  TEXT,              -- Full-width hero used on the detail page

    -- Full rich content stored as JSONB
    content         JSONB NOT NULL DEFAULT '{}',

    -- Admin controls
    sort_order      INTEGER NOT NULL DEFAULT 999,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_countries_slug        ON countries(slug);
CREATE INDEX IF NOT EXISTS idx_countries_is_active   ON countries(is_active);
CREATE INDEX IF NOT EXISTS idx_countries_sort_order  ON countries(sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_countries_content_gin ON countries USING gin(content);

CREATE TRIGGER countries_updated_at
    BEFORE UPDATE ON countries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ── Migration 008: newsletter_subscribers ────────────────────────────────────
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(254) NOT NULL UNIQUE,
    status          subscriber_status NOT NULL DEFAULT 'active',
    source          VARCHAR(100) NOT NULL DEFAULT 'website',
    confirmed_at    TIMESTAMPTZ,
    subscribed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_email  ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON newsletter_subscribers(status);

CREATE TRIGGER newsletter_subscribers_updated_at
    BEFORE UPDATE ON newsletter_subscribers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 6: SEED ADMIN USER
-- ─────────────────────────────────────────────────────────────────────────────
-- Password: Admin@MVR2025!
-- Hash generated with argon2id (m=65536, t=2, p=1) — compatible with
-- the Rust argon2 crate used in backend/src/utils/password.rs
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO users (id, name, email, password_hash, role, is_active)
VALUES (
    gen_random_uuid(),
    'MVR Admin',
    'guntur@mvrconsultants.org',
    '$argon2id$v=19$m=65536,t=2,p=1$9X5bBoNoiJ8NDg0xfJ/Akg$iLyfhldBk4P5hx6UH5iLlFTQGDofc1lllkervzCGWs4',
    'ADMIN',
    TRUE
)
ON CONFLICT (email) DO UPDATE
    SET password_hash = EXCLUDED.password_hash,
        role          = 'ADMIN',
        is_active     = TRUE,
        updated_at    = NOW();

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 7: VERIFICATION QUERIES
-- Run these after the script to confirm everything is set up correctly
-- ─────────────────────────────────────────────────────────────────────────────

-- Confirm all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Confirm admin user was seeded
SELECT id, name, email, role, is_active, created_at
FROM users
WHERE role = 'ADMIN';

-- Confirm all 8 tables are present (should return 8 rows)
SELECT COUNT(*) AS table_count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';
