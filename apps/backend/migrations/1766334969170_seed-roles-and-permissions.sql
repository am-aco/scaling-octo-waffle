-- Up Migration

/* Insert roles */
INSERT INTO roles (name, description) VALUES
    ('user', 'Standard user with basic permissions'),
    ('admin', 'Administrator with full system access');

/* Insert permissions */
INSERT INTO permissions (name, description) VALUES
    ('profile:read', 'Read own profile information'),
    ('profile:update', 'Update own profile information'),
    ('users:read', 'Read all user information'),
    ('users:create', 'Create new users'),
    ('users:update', 'Update any user information'),
    ('users:delete', 'Delete users');

/* Assign permissions to user role */
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'user'
AND p.name IN ('profile:read', 'profile:update');

/* Assign permissions to admin role */
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin'
AND p.name IN ('profile:read', 'profile:update', 'users:read', 'users:create', 'users:update', 'users:delete');

/* Set all existing users to 'user' role by default */
UPDATE users
SET role_id = (SELECT id FROM roles WHERE name = 'user')
WHERE role_id IS NULL;

/* Make role_id NOT NULL after setting defaults */
ALTER TABLE users ALTER COLUMN role_id SET NOT NULL;

-- Down Migration

/* Allow NULL values again */
ALTER TABLE users ALTER COLUMN role_id DROP NOT NULL;

/* Clear role assignments */
UPDATE users SET role_id = NULL;

/* Delete role-permission mappings */
DELETE FROM role_permissions;

/* Delete permissions */
DELETE FROM permissions;

/* Delete roles */
DELETE FROM roles;
