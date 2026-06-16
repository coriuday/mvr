-- =============================================================================
-- Migration 006: Create scholarships table
-- =============================================================================

DO $$ BEGIN
    CREATE TYPE scholarship_type AS ENUM (
        'MERIT_BASED',
        'NEED_BASED',
        'GOVERNMENT',
        'UNIVERSITY',
        'PRIVATE'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS scholarships (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(500) NOT NULL,
    scholarship_type    scholarship_type NOT NULL,
    country             VARCHAR(100) NOT NULL,
    amount              VARCHAR(100),         -- Flexible: "Full Tuition", "$5,000/year"
    deadline            DATE,
    description         TEXT,
    eligibility         TEXT,
    apply_url           TEXT,
    is_featured         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add country_id FK column if it doesn't exist (links scholarship to countries table)
ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS country_id UUID REFERENCES countries(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scholarships_type ON scholarships(scholarship_type);
CREATE INDEX IF NOT EXISTS idx_scholarships_country ON scholarships(country);
CREATE INDEX IF NOT EXISTS idx_scholarships_featured ON scholarships(is_featured);
CREATE INDEX IF NOT EXISTS idx_scholarships_deadline ON scholarships(deadline);
CREATE INDEX IF NOT EXISTS idx_scholarships_country_id ON scholarships(country_id);

DROP TRIGGER IF EXISTS scholarships_updated_at ON scholarships;
CREATE TRIGGER scholarships_updated_at
    BEFORE UPDATE ON scholarships
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
