import { pool } from "../infrastructure/database.js";
import type { PoolClient } from "pg";

export interface Session {
    id: string;
    user_id: string;
    created_at: Date;
    expires_at: Date;
}

export interface SessionUser {
    id: string;
    email: string;
}

export interface SessionWithUser extends Session {
    user: SessionUser;
}

interface SessionWithUserRow {
    id: string;
    user_id: string;
    created_at: Date;
    expires_at: Date;
    user_id_fk: string;
    user_email: string;
}

export class SessionRepository {
    async create(
        userId: string,
        expiresAt: Date,
        client?: PoolClient
    ): Promise<Session> {
        const query = `
            INSERT INTO sessions (user_id, expires_at)
            VALUES ($1, $2)
            RETURNING *
        `;

        const executor = client ?? pool;
        const result = await executor.query<Session>(query, [userId, expiresAt]);

        return result.rows[0]!;
    }

    async findById(
        sessionId: string,
        client?: PoolClient
    ): Promise<SessionWithUser | null> {
        const query = `
            SELECT
                sessions.id,
                sessions.user_id,
                sessions.created_at,
                sessions.expires_at,
                users.id AS user_id_fk,
                users.email AS user_email
            FROM sessions
            INNER JOIN users ON sessions.user_id = users.id
            WHERE sessions.id = $1
                AND sessions.expires_at > NOW()
                AND users.is_active = true
        `;

        const executor = client ?? pool;
        const result = await executor.query<SessionWithUserRow>(query, [sessionId]);
        const row = result.rows[0];

        if (!row) {
            return null;
        }

        return {
            id: row.id,
            user_id: row.user_id,
            created_at: row.created_at,
            expires_at: row.expires_at,
            user: {
                id: row.user_id_fk,
                email: row.user_email,
            },
        };
    }

    async delete(sessionId: string, client?: PoolClient): Promise<void> {
        const query = "DELETE FROM sessions WHERE id = $1";
        const executor = client ?? pool;
        await executor.query(query, [sessionId]);
    }

    async deleteAllForUser(userId: string, client?: PoolClient): Promise<void> {
        const query = "DELETE FROM sessions WHERE user_id = $1";
        const executor = client ?? pool;
        await executor.query(query, [userId]);
    }
}
