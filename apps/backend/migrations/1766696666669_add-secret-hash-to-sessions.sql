-- Up Migration
ALTER TABLE sessions
    ADD COLUMN secret_hash VARCHAR(64) NOT NULL DEFAULT '';

/* Populate existing sessions with random hashed secrets (invalidates existing sessions) */
UPDATE sessions SET secret_hash = encode(sha256(gen_random_bytes(32)), 'hex');

-- Down Migration
ALTER TABLE sessions
    DROP COLUMN IF EXISTS secret_hash;
