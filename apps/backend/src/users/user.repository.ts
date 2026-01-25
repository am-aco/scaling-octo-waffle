import { pool } from "../infrastructure/database/database.js";
import type { PoolClient } from "pg";

export interface User {
    id: string;
    email: string;
    password_hash: string;
    email_verified: Date | null;
    is_active: boolean;
    role_id: string;
    last_login: Date | null;
    failed_login_attempts: number;
    locked_until: Date | null;
    created_at: Date;
    updated_at: Date;
}

export interface CreateUserRecord {
    email: string;
    password_hash: string;
}

export interface CreateUserWithRoleRecord {
    email: string;
    password_hash: string;
    role_id: string;
}

export interface UpdateUserRecord {
    email?: string | undefined;
    is_active?: boolean | undefined;
    role_id?: string | undefined;
}


export class UserRepository {
    /*
     * Find a user by email address
     * Returns null if user doesn't exist
     */
    async findByEmail(email: string): Promise<User | null> {
        const result = await pool.query<User>(
            "SELECT * FROM users WHERE email = $1",
            [email.toLowerCase()]
        );

        return result.rows[0] ?? null;
    }

    /*
     * Find a user by ID
     * Returns null if user doesn't exist
     * Supports transactions via optional client parameter
     */
    async findById(id: string, client?: PoolClient): Promise<User | null> {
        const executor = client ?? pool;
        const result = await executor.query<User>("SELECT * FROM users WHERE id = $1", [
            id,
        ]);

        return result.rows[0] ?? null;
    }

    /*
     * Create a new user in the database
     * Returns the created user with generated ID and timestamps
     * Assigns 'user' role by default
     * Supports transactions via optional client parameter
     */
    async create(userData: CreateUserRecord, client?: PoolClient): Promise<User> {
        const executor = client ?? pool;
        const result = await executor.query<User>(
            `INSERT INTO users (email, password_hash, role_id)
                VALUES ($1, $2, (SELECT id FROM roles WHERE name = 'user'))
            RETURNING *`,
            [userData.email.toLowerCase(), userData.password_hash]
        );

        return result.rows[0]!;
    }

    /*
     * Update user's last login timestamp
     * Supports transactions via optional client parameter
     */
    async updateLastLogin(userId: string, client?: PoolClient): Promise<void> {
        const query = "UPDATE users SET last_login = NOW() WHERE id = $1";
        const executor = client ?? pool;
        await executor.query(query, [userId]);
    }

    /*
     * Find a user by ID with their role
     * Returns user profile data without sensitive fields like password_hash
     * Returns null if user doesn't exist
     */
    async findByIdWithRole(id: string): Promise<{
        id: string;
        email: string;
        is_active: boolean;
        created_at: Date;
        last_login: Date | null;
        role: string;
    } | null> {
        const result = await pool.query(
            `SELECT users.id, users.email, users.is_active, users.created_at, users.last_login, roles.name as role
             FROM users
             INNER JOIN roles ON users.role_id = roles.id
             WHERE users.id = $1`,
            [id]
        );

        return result.rows[0] ?? null;
    }

    /*
     * Get all users with their roles
     * Returns user data without sensitive fields like password_hash
     */
    async findAllWithRoles(): Promise<Array<{
        id: string;
        email: string;
        is_active: boolean;
        created_at: Date;
        role: string;
    }>> {
        const result = await pool.query(
            `SELECT users.id, users.email, users.is_active, users.created_at, roles.name as role
             FROM users
             INNER JOIN roles ON users.role_id = roles.id
             ORDER BY users.created_at DESC`
        );

        return result.rows;
    }

    /*
     * Create a new user with a specific role
     * Used by admins to create users with custom roles
     * Returns the created user with generated ID and timestamps
     */
    async createWithRole(userData: CreateUserWithRoleRecord): Promise<User> {
        const result = await pool.query<User>(
            `INSERT INTO users (email, password_hash, role_id)
                VALUES ($1, $2, $3)
            RETURNING *`,
            [userData.email.toLowerCase(), userData.password_hash, userData.role_id]
        );

        return result.rows[0]!;
    }

    /*
     * Update user fields
     * Only updates provided fields (partial update)
     * Returns the updated user or null if user doesn't exist
     */
    async update(userId: string, updates: UpdateUserRecord): Promise<User | null> {
        const fields: string[] = [];
        const values: unknown[] = [];
        let paramCount = 1;

        if (updates.email !== undefined) {
            fields.push(`email = $${paramCount}`);
            values.push(updates.email.toLowerCase());
            paramCount++;
        }

        if (updates.is_active !== undefined) {
            fields.push(`is_active = $${paramCount}`);
            values.push(updates.is_active);
            paramCount++;
        }

        if (updates.role_id !== undefined) {
            fields.push(`role_id = $${paramCount}`);
            values.push(updates.role_id);
            paramCount++;
        }

        if (fields.length === 0) {
            return await this.findById(userId);
        }

        fields.push(`updated_at = NOW()`);
        values.push(userId);

        const result = await pool.query<User>(
            `UPDATE users
             SET ${fields.join(", ")}
             WHERE id = $${paramCount}
             RETURNING *`,
            values
        );

        return result.rows[0] ?? null;
    }

    /*
     * Delete a user by ID
     * Returns true if user was deleted, false if user didn't exist
     */
    async deleteById(userId: string): Promise<boolean> {
        const result = await pool.query(
            "DELETE FROM users WHERE id = $1",
            [userId]
        );

        return result.rowCount !== null && result.rowCount > 0;
    }

    /*
     * Find user by ID with permissions
     * Used for JWT authentication to load user + permissions
     * Returns null if user doesn't exist or is inactive
     * Loads both role-based AND user-specific permissions
     */
    async findByIdWithPermissions(userId: string): Promise<{
        id: string;
        email: string;
        permissions: string[];
    } | null> {
        const userQuery = `
            SELECT users.id, users.email, users.role_id
            FROM users
            WHERE users.id = $1 AND users.is_active = true
        `;

        const userResult = await pool.query<{ id: string; email: string; role_id: string }>(
            userQuery,
            [userId]
        );

        const user = userResult.rows[0];

        if (!user) {
            return null;
        }

        const permissionsQuery = `
            SELECT DISTINCT permissions.name
            FROM permissions
            LEFT JOIN role_permissions ON permissions.id = role_permissions.permission_id AND role_permissions.role_id = $1
            LEFT JOIN user_permissions ON permissions.id = user_permissions.permission_id AND user_permissions.user_id = $2
            WHERE role_permissions.role_id IS NOT NULL OR user_permissions.user_id IS NOT NULL
            ORDER BY permissions.name
        `;

        const permissionsResult = await pool.query<{ name: string }>(
            permissionsQuery,
            [user.role_id, user.id]
        );

        return {
            id: user.id,
            email: user.email,
            permissions: permissionsResult.rows.map(p => p.name),
        };
    }

    /*
     * Update user's password
     * Supports transactions via optional client parameter
     * Used during password reset flow
     */
    async updatePassword(userId: string, passwordHash: string, client?: PoolClient): Promise<void> {
        const query = "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2";
        const executor = client ?? pool;
        await executor.query(query, [passwordHash, userId]);
    }

    /*
     * Mark user's email as verified
     * Supports transactions via optional client parameter
     * Used during email verification flow
     */
    async markEmailAsVerified(userId: string, client?: PoolClient): Promise<void> {
        const query = "UPDATE users SET email_verified = NOW(), updated_at = NOW() WHERE id = $1";
        const executor = client ?? pool;
        await executor.query(query, [userId]);
    }

    /*
     * Increment failed login attempts
     * Supports transactions via optional client parameter
     */
    async incrementFailedLoginAttempts(userId: string, client?: PoolClient): Promise<void> {
        const query = `
            UPDATE users
            SET failed_login_attempts = failed_login_attempts + 1, updated_at = NOW()
            WHERE id = $1
        `;
        const executor = client ?? pool;
        await executor.query(query, [userId]);
    }

    /*
     * Lock account until specified time
     * Supports transactions via optional client parameter
     */
    async lockAccount(userId: string, lockedUntil: Date, client?: PoolClient): Promise<void> {
        const query = `
            UPDATE users
            SET locked_until = $1, updated_at = NOW()
            WHERE id = $2
        `;
        const executor = client ?? pool;
        await executor.query(query, [lockedUntil, userId]);
    }

    /*
     * Reset failed login attempts and unlock account
     * Supports transactions via optional client parameter
     */
    async resetFailedLoginAttempts(userId: string, client?: PoolClient): Promise<void> {
        const query = `
            UPDATE users
            SET failed_login_attempts = 0, locked_until = NULL, updated_at = NOW()
            WHERE id = $1
        `;
        const executor = client ?? pool;
        await executor.query(query, [userId]);
    }
}
