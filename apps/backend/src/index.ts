import { config } from "./infrastructure/config.js";
import { pool, testConnection } from "./infrastructure/database.js";
import { createServer } from "./infrastructure/server.js";
import { logger } from "./infrastructure/logger.js";

/* Test database connection before starting */
await testConnection();

/* Create Express app */
const app = createServer();

/* Start listening */
const server = app.listen(config.port, () => {
    logger.info("Server started", {
        port: config.port,
        environment: config.nodeEnv,
        url: `http://localhost:${config.port}`,
    });
});

/* Graceful shutdown handler */
async function shutdown(signal: string): Promise<void> {
    logger.info("Graceful shutdown initiated", { signal });

    /* Stop accepting new connections */
    server.close((err) => {
        if (err) {
            logger.error("Error closing HTTP server", { error: err });
        } else {
            logger.info("HTTP server closed");
        }
    });

    try {
        /* Close database pool */
        await pool.end();
        logger.info("Database pool closed");

        logger.info("Graceful shutdown complete");
        process.exit(0);
    }
    catch (error) {
        logger.error("Error during shutdown", { error });
        process.exit(1);
    }
}

/* Timeout to force exit if graceful shutdown takes too long */
function forceExit(signal: string): void {
    const SHUTDOWN_TIMEOUT_MS = 10000;

    setTimeout(() => {
        logger.error("Forced exit due to shutdown timeout", {
            timeoutMs: SHUTDOWN_TIMEOUT_MS,
        });
        process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS).unref();

    shutdown(signal);
}

/* Handle termination signals */
process.on("SIGTERM", () => forceExit("SIGTERM"));
process.on("SIGINT", () => forceExit("SIGINT"));
