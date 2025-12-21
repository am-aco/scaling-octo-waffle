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

/* Helper to get required environment variable or throw */
function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

/* Helper to get required environment variable as integer */
function requireEnvInt(name: string): number {
    const value = requireEnv(name);
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
        throw new Error(`Invalid ${name}: "${value}". Must be a number`);
    }
    return parsed;
}

function loadConfig(): Config {
    const nodeEnv = requireEnv("NODE_ENV");

    /* Validate NODE_ENV is a valid value */
    if (!["development", "production", "test"].includes(nodeEnv)) {
        throw new Error(
            `Invalid NODE_ENV: "${nodeEnv}". Must be development, production, or test`
        );
    }

    return {
        nodeEnv: nodeEnv as Config["nodeEnv"],
        port: requireEnvInt("PORT"),
        database: {
            host: requireEnv("DB_HOST"),
            port: requireEnvInt("DB_PORT"),
            name: requireEnv("DB_NAME"),
            user: requireEnv("DB_USER"),
            password: requireEnv("DB_PASSWORD"),
        },
    };
}

/* Export singleton config - loaded once at startup */
export const config = loadConfig();
