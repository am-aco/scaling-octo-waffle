import "dotenv/config";

/* Application configuration loaded from environment variables */

interface Config {
    nodeEnv: "development" | "production" | "test";
    port: number;
    database: {
        host: string;
        port: number;
        name: string;
        user: string;
        password: string;
    };
}

function loadConfig(): Config {
    const nodeEnv = process.env["NODE_ENV"];
    const port = process.env["PORT"];
    const dbHost = process.env["DB_HOST"];
    const dbPort = process.env["DB_PORT"];
    const dbName = process.env["DB_NAME"];
    const dbUser = process.env["DB_USER"];
    const dbPassword = process.env["DB_PASSWORD"];

    /* Validate required variables exist */
    if (!nodeEnv) {
        throw new Error("Missing required environment variable: NODE_ENV");
    }

    if (!port) {
        throw new Error("Missing required environment variable: PORT");
    }

    if (!dbHost) {
        throw new Error("Missing required environment variable: DB_HOST");
    }

    if (!dbPort) {
        throw new Error("Missing required environment variable: DB_PORT");
    }

    if (!dbName) {
        throw new Error("Missing required environment variable: DB_NAME");
    }

    if (!dbUser) {
        throw new Error("Missing required environment variable: DB_USER");
    }

    if (!dbPassword) {
        throw new Error("Missing required environment variable: DB_PASSWORD");
    }

    /* Validate NODE_ENV is a valid value */
    if (!["development", "production", "test"].includes(nodeEnv)) {
        throw new Error(
            `Invalid NODE_ENV: ${nodeEnv}. Must be development, production, or test`
        );
    }

    /* Parse PORT as number */
    const parsedPort = parseInt(port, 10);
    if (isNaN(parsedPort)) {
        throw new Error(`Invalid PORT: ${port}. Must be a number`);
    }

    /* Parse DB_PORT as number */
    const parsedDbPort = parseInt(dbPort, 10);
    if (isNaN(parsedDbPort)) {
        throw new Error(`Invalid DB_PORT: ${dbPort}. Must be a number`);
    }

    return {
        nodeEnv: nodeEnv as Config["nodeEnv"],
        port: parsedPort,
        database: {
            host: dbHost,
            port: parsedDbPort,
            name: dbName,
            user: dbUser,
            password: dbPassword,
        },
    };
}

/* Export singleton config - loaded once at startup */
export const config = loadConfig();
