-- Up Migration
ALTER TABLE sessions
    ADD COLUMN is_remember_me BOOLEAN NOT NULL DEFAULT FALSE;

/* Index for querying remember me sessions */
CREATE INDEX idx_sessions_is_remember_me ON sessions(is_remember_me) WHERE is_remember_me = TRUE;

-- Down Migration
DROP INDEX IF EXISTS idx_sessions_is_remember_me;
ALTER TABLE sessions
    DROP COLUMN IF EXISTS is_remember_me;
