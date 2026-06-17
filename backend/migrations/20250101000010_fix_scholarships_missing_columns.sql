-- =============================================================================
-- Migration 010: Add missing columns to scholarships table
-- The scholarships table was created without the country column in some
-- environments. This migration safely adds it if it doesn't exist, and also
-- ensures the scholarship_type enum exists.
-- =============================================================================

-- Add country column if it doesn't already exist
ALTER TABLE scholarships
    ADD COLUMN IF NOT EXISTS country VARCHAR(100) NOT NULL DEFAULT '';

-- Add any other potentially missing columns from the original schema
ALTER TABLE scholarships
    ADD COLUMN IF NOT EXISTS amount VARCHAR(100);

ALTER TABLE scholarships
    ADD COLUMN IF NOT EXISTS deadline DATE;

ALTER TABLE scholarships
    ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE scholarships
    ADD COLUMN IF NOT EXISTS eligibility TEXT;

ALTER TABLE scholarships
    ADD COLUMN IF NOT EXISTS apply_url TEXT;

ALTER TABLE scholarships
    ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;

-- Recreate indexes if missing (IF NOT EXISTS is not standard for indexes, use DO block)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_scholarships_country') THEN
        CREATE INDEX idx_scholarships_country ON scholarships(country);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_scholarships_featured') THEN
        CREATE INDEX idx_scholarships_featured ON scholarships(is_featured);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_scholarships_deadline') THEN
        CREATE INDEX idx_scholarships_deadline ON scholarships(deadline);
    END IF;
END $$;
