import type { Pool, PoolClient } from 'pg';

export interface PasswordResetToken {
    id: string;
    userId: string;
    token: string;
    createdAt: Date;
    expiresAt: Date;
    usedAt: Date | null;
}

export interface CreatePasswordResetTokenData {
    userId: string;
    token: string;
    expiresAt: Date;
}

export class PasswordResetTokenRepository {
    constructor(private pool: Pool) {}

    async create(
        data: CreatePasswordResetTokenData,
        client?: PoolClient,
    ): Promise<PasswordResetToken> {
        const db = client ?? this.pool;

        const result = await db.query<PasswordResetToken>(
            `INSERT INTO password_reset_tokens (user_id, token, expires_at)
             VALUES ($1, $2, $3)
             RETURNING id, user_id AS "userId", token, created_at AS "createdAt",
                       expires_at AS "expiresAt", used_at AS "usedAt"`,
            [data.userId, data.token, data.expiresAt],
        );

        return result.rows[0]!;
    }

    async findByToken(token: string): Promise<PasswordResetToken | null> {
        const result = await this.pool.query<PasswordResetToken>(
            `SELECT id, user_id AS "userId", token, created_at AS "createdAt",
                    expires_at AS "expiresAt", used_at AS "usedAt"
             FROM password_reset_tokens
             WHERE token = $1`,
            [token],
        );

        return result.rows[0] ?? null;
    }

    async markAsUsed(token: string, client?: PoolClient): Promise<boolean> {
        const db = client ?? this.pool;

        const result = await db.query(
            `UPDATE password_reset_tokens
             SET used_at = NOW()
             WHERE token = $1 AND used_at IS NULL`,
            [token],
        );

        return result.rowCount !== null && result.rowCount > 0;
    }

    async deleteUnusedByUserId(userId: string, client?: PoolClient): Promise<void> {
        const db = client ?? this.pool;

        await db.query(
            `DELETE FROM password_reset_tokens
             WHERE user_id = $1 AND used_at IS NULL`,
            [userId],
        );
    }

    async deleteExpired(): Promise<number> {
        const result = await this.pool.query(
            `DELETE FROM password_reset_tokens
             WHERE expires_at < NOW()`,
        );

        return result.rowCount ?? 0;
    }
}
