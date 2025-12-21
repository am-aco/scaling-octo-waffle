import { pool } from "../infrastructure/database.js";
import type { PoolClient } from "pg";

export interface User {
    id: string;
    email: string;
    password_hash: string;
    email_verified: Date | null;
    is_active: boolean;
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
     */
    async create(userData: CreateUserData): Promise<User> {
        const result = await pool.query<User>(
            `INSERT INTO users (email, password_hash)
                VALUES ($1, $2)
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
}
