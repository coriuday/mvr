-- =============================================================================
-- Migration 009: Add category and read_time columns to blogs table
-- =============================================================================
-- These columns were computed on the frontend but missing from the DB schema.
-- category: free-text label (Visa Guide, Scholarships, etc.) — defaults to NULL
--           so existing rows are unaffected; frontend falls back to "Country Guide"
-- read_time: stored as TEXT, computed from word count (avg 200 WPM)
--            Populated by a trigger/application layer — nullable for backwards compat
-- =============================================================================

ALTER TABLE blogs ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS read_time VARCHAR(20);

-- Backfill read_time for existing posts based on approximate word count
-- (200 WPM average reading speed; minimum 1 min)
UPDATE blogs
SET read_time = GREATEST(1, ROUND(array_length(string_to_array(trim(content), ' '), 1)::numeric / 200))::text || ' min read'
WHERE read_time IS NULL AND content IS NOT NULL AND trim(content) != '';

-- Index for category filtering on blog listing pages
CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs(category);
