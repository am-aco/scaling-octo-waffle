import type { PoolClient } from 'pg';
import { pool } from '../infrastructure/database/database.js';

export interface EmailVerificationToken {
    id: string;
    user_id: string;
    token: string;
    created_at: Date;
    expires_at: Date;
    used_at: Date | null;
}

export interface CreateEmailVerificationTokenRecord {
    user_id: string;
    token: string;
    expires_at: Date;
}

export class EmailVerificationTokenRepository {
    async create(
        data: CreateEmailVerificationTokenRecord,
        client?: PoolClient,
    ): Promise<EmailVerificationToken> {
        const executor = client ?? pool;

        const result = await executor.query<EmailVerificationToken>(
            `INSERT INTO email_verification_tokens (user_id, token, expires_at)
             VALUES ($1, $2, $3)
             RETURNING id, user_id, token, created_at, expires_at, used_at`,
            [data.user_id, data.token, data.expires_at],
        );

        return result.rows[0]!;
    }

    async findByToken(token: string): Promise<EmailVerificationToken | null> {
        const result = await pool.query<EmailVerificationToken>(
            `SELECT id, user_id, token, created_at, expires_at, used_at
             FROM email_verification_tokens
             WHERE token = $1`,
            [token],
        );

        return result.rows[0] ?? null;
    }

    async markAsUsed(token: string, client?: PoolClient): Promise<boolean> {
        const executor = client ?? pool;

        const result = await executor.query(
            `UPDATE email_verification_tokens
             SET used_at = NOW()
             WHERE token = $1 AND used_at IS NULL`,
            [token],
        );

        return result.rowCount !== null && result.rowCount > 0;
    }

    async deleteUnusedByUserId(userId: string, client?: PoolClient): Promise<void> {
        const executor = client ?? pool;

        await executor.query(
            `DELETE FROM email_verification_tokens
             WHERE user_id = $1 AND used_at IS NULL`,
            [userId],
        );
    }
}
