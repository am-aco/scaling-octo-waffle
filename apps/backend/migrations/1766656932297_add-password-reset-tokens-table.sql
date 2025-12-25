-- Up Migration
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ DEFAULT NULL
);

/* Index on user_id for efficient lookup of user's reset tokens */
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);

/* Index on token for fast validation lookups */
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);

/* Index on expires_at for cleanup of expired tokens */
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- Down Migration
DROP INDEX IF EXISTS idx_password_reset_tokens_expires_at;
DROP INDEX IF EXISTS idx_password_reset_tokens_token;
DROP INDEX IF EXISTS idx_password_reset_tokens_user_id;
DROP TABLE IF EXISTS password_reset_tokens;
