import { Pool, type PoolClient } from "pg";
import { config } from "./config.js";
import { logger } from "./logger.js";

export const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

/* Log pool errors (connection issues outside of queries) */
pool.on("error", (err) => {
    logger.error("Unexpected database pool error", { error: err });
});

export async function testConnection(): Promise<void> {
    try {
        const client = await pool.connect();
        await client.query("SELECT NOW()");
        client.release();
        logger.info("Database connection successful");
    }
    catch (error) {
        logger.error("Database connection failed", { error });
        throw error;
    }
}

export async function withTransaction<T>(
    callback: (client: PoolClient) => Promise<T>
): Promise<T> {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");
        const result = await callback(client);
        await client.query("COMMIT");
        return result;
    }
    catch (error) {
        await client.query("ROLLBACK");
        throw error;
    }
    finally {
        client.release();
    }
}
