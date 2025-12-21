import { Pool, type PoolClient } from "pg";
import { config } from "./config.js";

export const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
});

export async function testConnection(): Promise<void> {
    try {
        const client = await pool.connect();
        await client.query("SELECT NOW()");
        client.release();
        console.log("✓ Database connection successful");
    }
    catch (error) {
        console.error("✗ Database connection failed:", error);
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
