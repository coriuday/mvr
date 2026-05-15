-- =============================================================================
-- Migration 006: Create scholarships table
-- =============================================================================

CREATE TYPE scholarship_type AS ENUM (
    'MERIT_BASED',
    'NEED_BASED',
    'GOVERNMENT',
    'UNIVERSITY',
    'PRIVATE'
);

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

-- Indexes
CREATE INDEX idx_scholarships_type ON scholarships(scholarship_type);
CREATE INDEX idx_scholarships_country ON scholarships(country);
CREATE INDEX idx_scholarships_featured ON scholarships(is_featured);
CREATE INDEX idx_scholarships_deadline ON scholarships(deadline);

CREATE TRIGGER scholarships_updated_at
    BEFORE UPDATE ON scholarships
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
