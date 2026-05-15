-- =============================================================================
-- Migration 005: Create testimonials table
-- =============================================================================

CREATE TABLE IF NOT EXISTS testimonials (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_name    VARCHAR(255) NOT NULL,
    review          TEXT NOT NULL,
    image_url       TEXT,
    rating          SMALLINT NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
    country         VARCHAR(100),
    university      VARCHAR(255),
    course          VARCHAR(255),
    is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_testimonials_featured ON testimonials(is_featured);
CREATE INDEX idx_testimonials_rating ON testimonials(rating);
