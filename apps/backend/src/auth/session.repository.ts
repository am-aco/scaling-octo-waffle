import { pool } from "../infrastructure/database.js";
import type { PoolClient } from "pg";

export interface Session {
    id: string;
    user_id: string;
    created_at: Date;
    expires_at: Date;
    is_remember_me: boolean;
    csrf_token: string;
    secret_hash: string;
}

export interface SessionUser {
    id: string;
    email: string;
    permissions: string[];
}

export interface SessionWithUser extends Session {
    user: SessionUser;
}

export interface CreateSessionRecord {
    id: string;
    user_id: string;
    expires_at: Date;
    is_remember_me?: boolean;
    csrf_token: string;
    secret_hash: string;
}

interface SessionWithUserRow {
    id: string;
    user_id: string;
    created_at: Date;
    expires_at: Date;
    is_remember_me: boolean;
    csrf_token: string;
    secret_hash: string;
    user_id_fk: string;
    user_email: string;
    user_role_id: string;
}

export class SessionRepository {
    async create(
        data: CreateSessionRecord,
        client?: PoolClient
    ): Promise<Session> {
        const query = `
            INSERT INTO sessions (id, user_id, expires_at, is_remember_me, csrf_token, secret_hash)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const executor = client ?? pool;
        const result = await executor.query<Session>(query, [
            data.id,
            data.user_id,
            data.expires_at,
            data.is_remember_me ?? false,
            data.csrf_token,
            data.secret_hash,
        ]);

        return result.rows[0]!;
    }

    async findById(
        sessionId: string,
        client?: PoolClient
    ): Promise<SessionWithUser | null> {
        const executor = client ?? pool;

        const sessionQuery = `
            SELECT
                sessions.id,
                sessions.user_id,
                sessions.created_at,
                sessions.expires_at,
                sessions.is_remember_me,
                sessions.csrf_token,
                sessions.secret_hash,
                users.id AS user_id_fk,
                users.email AS user_email,
                users.role_id AS user_role_id
            FROM sessions
            INNER JOIN users ON sessions.user_id = users.id
            WHERE sessions.id = $1
                AND sessions.expires_at > NOW()
                AND users.is_active = true
        `;

        const sessionResult = await executor.query<SessionWithUserRow>(sessionQuery, [sessionId]);
        const row = sessionResult.rows[0];

        if (!row) {
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

        const permissionsResult = await executor.query<{ name: string }>(
            permissionsQuery,
            [row.user_role_id, row.user_id_fk]
        );

        return {
            id: row.id,
            user_id: row.user_id,
            created_at: row.created_at,
            expires_at: row.expires_at,
            is_remember_me: row.is_remember_me,
            csrf_token: row.csrf_token,
            secret_hash: row.secret_hash,
            user: {
                id: row.user_id_fk,
                email: row.user_email,
                permissions: permissionsResult.rows.map(p => p.name),
            },
        };
    }

    async updateExpiration(
        sessionId: string,
        expiresAt: Date,
        client?: PoolClient
    ): Promise<void> {
        const query = "UPDATE sessions SET expires_at = $1 WHERE id = $2";
        const executor = client ?? pool;
        await executor.query(query, [expiresAt, sessionId]);
    }

    async deleteById(sessionId: string, client?: PoolClient): Promise<void> {
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
