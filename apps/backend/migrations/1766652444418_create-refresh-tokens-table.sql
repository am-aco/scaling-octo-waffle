-- Up Migration
CREATE TABLE refresh_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_family UUID NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL,
      revoked_at TIMESTAMPTZ DEFAULT NULL
  );

/* Index on user_id for efficient lookup of user's refresh tokens */
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);

/* Index on token_family for rotation detection */
CREATE INDEX idx_refresh_tokens_token_family ON refresh_tokens(token_family);

/* Index on expires_at for cleanup of expired tokens */
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- Down Migration
 DROP INDEX IF EXISTS idx_refresh_tokens_expires_at;
  DROP INDEX IF EXISTS idx_refresh_tokens_token_family;
  DROP INDEX IF EXISTS idx_refresh_tokens_user_id;
  DROP TABLE IF EXISTS refresh_tokens;