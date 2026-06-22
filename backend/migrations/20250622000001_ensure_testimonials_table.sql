-- Idempotent repair: ensure testimonials table exists on production DBs
-- where migration 005 may not have been applied.

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

CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(is_featured);
CREATE INDEX IF NOT EXISTS idx_testimonials_rating   ON testimonials(rating);
