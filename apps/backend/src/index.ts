import { config } from "./infrastructure/config.js";
import { pool, testConnection } from "./infrastructure/database.js";
import { createServer } from "./infrastructure/server.js";

/* Test database connection before starting */
await testConnection();

/* Create Express app */
const app = createServer();

/* Start listening */
const server = app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
});

/* Graceful shutdown handler */
async function shutdown(signal: string): Promise<void> {
    console.log(`\n${signal} received. Starting graceful shutdown...`);

    /* Stop accepting new connections */
    server.close((err) => {
        if (err) {
            console.error("Error closing HTTP server:", err);
        } else {
            console.log("HTTP server closed");
        }
    });

    try {
        /* Close database pool */
        await pool.end();
        console.log("Database pool closed");

        console.log("Graceful shutdown complete");
        process.exit(0);
    }
    catch (error) {
        console.error("Error during shutdown:", error);
        process.exit(1);
    }
}

/* Timeout to force exit if graceful shutdown takes too long */
function forceExit(signal: string): void {
    const SHUTDOWN_TIMEOUT_MS = 10000;

    setTimeout(() => {
        console.error(`Forced exit after ${SHUTDOWN_TIMEOUT_MS}ms timeout`);
        process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS).unref();

    shutdown(signal);
}

/* Handle termination signals */
process.on("SIGTERM", () => forceExit("SIGTERM"));
process.on("SIGINT", () => forceExit("SIGINT"));
