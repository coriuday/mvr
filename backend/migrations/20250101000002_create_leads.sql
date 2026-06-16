-- =============================================================================
-- Migration 002: Create leads table
-- =============================================================================

DO $$ BEGIN
    CREATE TYPE lead_status AS ENUM ('NEW', 'CONTACTED', 'IN_PROGRESS', 'CONVERTED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    CREATE TYPE lead_source AS ENUM ('WEBSITE', 'REFERRAL', 'SOCIAL_MEDIA', 'PHONE_CALL', 'WALK_IN', 'OTHER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

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

-- Indexes
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);

DROP TRIGGER IF EXISTS leads_updated_at ON leads;
CREATE TRIGGER leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
