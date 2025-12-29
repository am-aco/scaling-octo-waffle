-- Up Migration
ALTER TABLE sessions
    ADD COLUMN csrf_token VARCHAR(64) NOT NULL DEFAULT '';

/* Populate existing sessions with random tokens */
UPDATE sessions SET csrf_token = encode(gen_random_bytes(32), 'base64');

-- Down Migration
ALTER TABLE sessions
    DROP COLUMN IF EXISTS csrf_token;
