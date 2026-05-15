-- =============================================================================
-- Migration 003: Create blogs table
-- =============================================================================

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
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_blogs_slug ON blogs(slug);
CREATE INDEX idx_blogs_published ON blogs(published);
CREATE INDEX idx_blogs_created_at ON blogs(created_at DESC);
CREATE INDEX idx_blogs_tags ON blogs USING gin(tags);

CREATE TRIGGER blogs_updated_at
    BEFORE UPDATE ON blogs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
