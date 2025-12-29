import { pool } from "../infrastructure/database.js";
import type { PoolClient } from "pg";

export interface RefreshToken {
    id: string;
    user_id: string;
    token_family: string;
    created_at: Date;
    expires_at: Date;
    revoked_at: Date | null;
}

export interface CreateRefreshTokenRecord {
    user_id: string;
    token_family: string;
    expires_at: Date;
}

export class RefreshTokenRepository {
    async create(
        data: CreateRefreshTokenRecord,
        client?: PoolClient
    ): Promise<RefreshToken> {
        const query = `
            INSERT INTO refresh_tokens (user_id, token_family, expires_at)
            VALUES ($1, $2, $3)
            RETURNING *
        `;

        const executor = client ?? pool;
        const result = await executor.query<RefreshToken>(query, [
            data.user_id,
            data.token_family,
            data.expires_at,
        ]);

        return result.rows[0]!;
    }

    /* Find a refresh token by ID (only if not expired and not revoked) */
    async findById(tokenId: string): Promise<RefreshToken | null> {
        const query = `
            SELECT * FROM refresh_tokens
            WHERE id = $1
                AND expires_at > NOW()
                AND revoked_at IS NULL
        `;

        const result = await pool.query<RefreshToken>(query, [tokenId]);
        return result.rows[0] ?? null;
    }

    /* Revoke a refresh token (soft delete) */
    async revoke(tokenId: string, client?: PoolClient): Promise<void> {
        const query = `
            UPDATE refresh_tokens
            SET revoked_at = NOW()
            WHERE id = $1
        `;

        const executor = client ?? pool;
        await executor.query(query, [tokenId]);
    }
}
