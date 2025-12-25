INSERT INTO permissions (name, description) VALUES
    ('posts:moderate', 'Moderate posts (edit and delete any post)');

INSERT INTO role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM roles
CROSS JOIN permissions
WHERE roles.name = 'admin'
AND permissions.name = 'posts:moderate';
