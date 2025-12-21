-- Up Migration

ALTER TABLE users
ADD COLUMN role_id UUID REFERENCES roles(id) ON DELETE RESTRICT;

CREATE INDEX idx_users_role_id ON users(role_id);

-- Down Migration

DROP INDEX IF EXISTS idx_users_role_id;
ALTER TABLE users DROP COLUMN IF EXISTS role_id;
