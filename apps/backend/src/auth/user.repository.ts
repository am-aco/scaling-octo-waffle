import { pool } from "../infrastructure/database.js";
import type { PoolClient } from "pg";

export interface User {
    id: string;
    email: string;
    password_hash: string;
    email_verified: Date | null;
    is_active: boolean;
    role_id: string;
    last_login: Date | null;
    created_at: Date;
    updated_at: Date;
}

export interface CreateUserData {
    email: string;
    password_hash: string;
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
     */
    async findById(id: string): Promise<User | null> {
        const result = await pool.query<User>("SELECT * FROM users WHERE id = $1", [
            id,
        ]);

        return result.rows[0] ?? null;
    }

    /*
     * Create a new user in the database
     * Returns the created user with generated ID and timestamps
     * Assigns 'user' role by default
     */
    async create(userData: CreateUserData): Promise<User> {
        const result = await pool.query<User>(
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
}
