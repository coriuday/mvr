-- =============================================================================
-- Migration 007: Create countries table
--
-- Design decision: The `content` JSONB column stores the full rich country data
-- (tuition fees, scholarships, visa info, FAQs, universities) that was
-- previously hard-coded in frontend JSON files.  The lightweight scalar columns
-- (slug, name, flag, tagline, image_url, sort_order, is_active) drive the
-- listing/card page and allow admin editing without redeploying the frontend.
--
-- This migration is SAFE to apply to an existing database:
--   • CREATE TABLE IF NOT EXISTS — idempotent
--   • All indexes use IF NOT EXISTS
--   • No DROP or ALTER statements
--   • The function update_updated_at_column already exists from migration 001
-- =============================================================================

CREATE TABLE IF NOT EXISTS countries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Card metadata (drives the /countries listing grid)
    slug            VARCHAR(100) NOT NULL UNIQUE,
    name            VARCHAR(200) NOT NULL,
    flag            VARCHAR(10)  NOT NULL,
    tagline         VARCHAR(200) NOT NULL DEFAULT '',
    image_url       TEXT,              -- Unsplash / Cloudinary URL for card thumbnail
    hero_image_url  TEXT,              -- Full-width hero used on the detail page

    -- Full rich content stored as JSONB so we avoid 8 join tables
    -- Schema mirrors CountryData from frontend/src/types/country.ts
    content         JSONB NOT NULL DEFAULT '{}',

    -- Admin controls
    sort_order      INTEGER NOT NULL DEFAULT 999,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_countries_slug        ON countries(slug);
CREATE INDEX IF NOT EXISTS idx_countries_is_active   ON countries(is_active);
CREATE INDEX IF NOT EXISTS idx_countries_sort_order  ON countries(sort_order ASC);

-- Full-text search on the JSONB content (popular programs, university names etc.)
CREATE INDEX IF NOT EXISTS idx_countries_content_gin ON countries USING gin(content);

-- Auto-update updated_at (reuses the function defined in migration 001)
DO $$ BEGIN
    CREATE TRIGGER countries_updated_at
        BEFORE UPDATE ON countries
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
