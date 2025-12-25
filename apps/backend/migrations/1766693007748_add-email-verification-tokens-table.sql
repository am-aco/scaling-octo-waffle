-- Up Migration
CREATE TABLE email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ DEFAULT NULL
);

/* Index on user_id for efficient lookup of user's verification tokens */
CREATE INDEX idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);

/* Index on token for fast validation lookups */
CREATE INDEX idx_email_verification_tokens_token ON email_verification_tokens(token);

/* Index on expires_at for cleanup of expired tokens */
CREATE INDEX idx_email_verification_tokens_expires_at ON email_verification_tokens(expires_at);

-- Down Migration
DROP INDEX IF EXISTS idx_email_verification_tokens_expires_at;
DROP INDEX IF EXISTS idx_email_verification_tokens_token;
DROP INDEX IF EXISTS idx_email_verification_tokens_user_id;
DROP TABLE IF EXISTS email_verification_tokens;
