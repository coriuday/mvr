-- =============================================================================
-- Migration 004: Create universities table
-- =============================================================================

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

-- Indexes
CREATE INDEX idx_universities_country ON universities(country);
CREATE INDEX idx_universities_ranking ON universities(ranking);
CREATE INDEX idx_universities_featured ON universities(is_featured);

CREATE TRIGGER universities_updated_at
    BEFORE UPDATE ON universities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
