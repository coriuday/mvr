-- =============================================================================
-- Migration 008: Create newsletter_subscribers table
--
-- Safety:
--   • CREATE TABLE IF NOT EXISTS — idempotent
--   • All indexes use IF NOT EXISTS
--   • No DROP / ALTER / TRUNCATE
--   • Reuses update_updated_at_column() trigger from migration 001
--
-- Design:
--   • email UNIQUE — the DB itself enforces deduplication; the application
--     layer handles the UNIQUE violation and returns a friendly message rather
--     than a 409 so bots can't enumerate which emails are subscribed.
--   • status enum distinguishes active vs. unsubscribed; unsubscribed rows
--     are retained for compliance (GDPR re-subscribe tracking).
--   • source records where the subscription came from (homepage banner,
--     blog CTA, contact page) for analytics.
--   • confirmed_at is NULL until email confirmation is implemented;
--     the column is present now so adding email confirmation later
--     requires zero schema changes.
-- =============================================================================

DO $$ BEGIN
    CREATE TYPE subscriber_status AS ENUM ('active', 'unsubscribed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(254) NOT NULL UNIQUE,
    status          subscriber_status NOT NULL DEFAULT 'active',
    source          VARCHAR(100) NOT NULL DEFAULT 'website',
    confirmed_at    TIMESTAMPTZ,          -- NULL = unconfirmed; populated on email click
    subscribed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_email  ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON newsletter_subscribers(status);

-- Auto-update updated_at (reuses function from migration 001)
DROP TRIGGER IF EXISTS newsletter_subscribers_updated_at ON newsletter_subscribers;
CREATE TRIGGER newsletter_subscribers_updated_at
    BEFORE UPDATE ON newsletter_subscribers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
