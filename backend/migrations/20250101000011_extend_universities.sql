-- =============================================================================
-- Migration 011: Extend universities with full public-site schema
-- =============================================================================

ALTER TABLE universities ADD COLUMN IF NOT EXISTS slug VARCHAR(100);
ALTER TABLE universities ADD COLUMN IF NOT EXISTS flag VARCHAR(10);
ALTER TABLE universities ADD COLUMN IF NOT EXISTS fees TEXT;
ALTER TABLE universities ADD COLUMN IF NOT EXISTS intake VARCHAR(100);
ALTER TABLE universities ADD COLUMN IF NOT EXISTS duration VARCHAR(100);
ALTER TABLE universities ADD COLUMN IF NOT EXISTS scholarship TEXT;
ALTER TABLE universities ADD COLUMN IF NOT EXISTS ielts VARCHAR(50);
ALTER TABLE universities ADD COLUMN IF NOT EXISTS ielts_min DOUBLE PRECISION;
ALTER TABLE universities ADD COLUMN IF NOT EXISTS gpa_min DOUBLE PRECISION;
ALTER TABLE universities ADD COLUMN IF NOT EXISTS annual_tuition_usd INTEGER;
ALTER TABLE universities ADD COLUMN IF NOT EXISTS programs TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE universities ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- ranking was INTEGER — convert to TEXT for labels like "#1 QS"
ALTER TABLE universities ALTER COLUMN ranking DROP NOT NULL;
ALTER TABLE universities ALTER COLUMN ranking TYPE TEXT USING (
    CASE WHEN ranking IS NULL THEN NULL ELSE ranking::text END
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_universities_slug ON universities(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_universities_is_active ON universities(is_active);
