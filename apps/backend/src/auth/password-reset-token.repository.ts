import type { PoolClient } from 'pg';
import { pool } from '../infrastructure/database.js';

export interface PasswordResetToken {
    id: string;
    user_id: string;
    token: string;
    created_at: Date;
    expires_at: Date;
    used_at: Date | null;
}

export interface CreatePasswordResetTokenData {
    user_id: string;
    token: string;
    expires_at: Date;
}

export class PasswordResetTokenRepository {
    async create(
        data: CreatePasswordResetTokenData,
        client?: PoolClient,
    ): Promise<PasswordResetToken> {
        const executor = client ?? pool;

        const result = await executor.query<PasswordResetToken>(
            `INSERT INTO password_reset_tokens (user_id, token, expires_at)
             VALUES ($1, $2, $3)
             RETURNING id, user_id, token, created_at, expires_at, used_at`,
            [data.user_id, data.token, data.expires_at],
        );

        return result.rows[0]!;
    }

    async findByToken(token: string): Promise<PasswordResetToken | null> {
        const result = await pool.query<PasswordResetToken>(
            `SELECT id, user_id, token, created_at, expires_at, used_at
             FROM password_reset_tokens
             WHERE token = $1`,
            [token],
        );

        return result.rows[0] ?? null;
    }

    async markAsUsed(token: string, client?: PoolClient): Promise<boolean> {
        const executor = client ?? pool;

        const result = await executor.query(
            `UPDATE password_reset_tokens
             SET used_at = NOW()
             WHERE token = $1 AND used_at IS NULL`,
            [token],
        );

        return result.rowCount !== null && result.rowCount > 0;
    }

    async deleteUnusedByUserId(userId: string, client?: PoolClient): Promise<void> {
        const executor = client ?? pool;

        await executor.query(
            `DELETE FROM password_reset_tokens
             WHERE user_id = $1 AND used_at IS NULL`,
            [userId],
        );
    }
}
