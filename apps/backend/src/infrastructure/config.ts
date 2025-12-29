import "dotenv/config";

/* Application configuration loaded from environment variables */

interface Config {
    nodeEnv: "development" | "production" | "test";
    port: number;
    appBaseUrl: string;
    allowedOrigins: string[];
    database: {
        host: string;
        port: number;
        name: string;
        user: string;
        password: string;
    };
    jwt: {
        secret: string;
        expiresIn: string | number;
        accessTokenExpiresIn: string | number;
        refreshTokenExpiresIn: string | number;
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

/* Helper to get optional environment variable with default */
function getEnvOrDefault(name: string, defaultValue: string): string {
    return process.env[name] ?? defaultValue;
}

function loadConfig(): Config {
    const nodeEnv = requireEnv("NODE_ENV");

    /* Validate NODE_ENV is a valid value */
    if (!["development", "production", "test"].includes(nodeEnv)) {
        throw new Error(
            `Invalid NODE_ENV: "${nodeEnv}". Must be development, production, or test`
        );
    }

    /* Parse comma-separated list of allowed origins for CORS */
    const allowedOriginsRaw = getEnvOrDefault("ALLOWED_ORIGINS", "");
    const allowedOrigins = allowedOriginsRaw
        ? allowedOriginsRaw.split(",").map((origin) => origin.trim())
        : [];

    return {
        nodeEnv: nodeEnv as Config["nodeEnv"],
        port: requireEnvInt("PORT"),
        appBaseUrl: requireEnv("APP_BASE_URL"),
        allowedOrigins,
        database: {
            host: requireEnv("DB_HOST"),
            port: requireEnvInt("DB_PORT"),
            name: requireEnv("DB_NAME"),
            user: requireEnv("DB_USER"),
            password: requireEnv("DB_PASSWORD"),
        },
        jwt: {
            secret: requireEnv("JWT_SECRET"),
            expiresIn: requireEnv("JWT_EXPIRES_IN"),
            accessTokenExpiresIn: requireEnv("JWT_ACCESS_TOKEN_EXPIRES_IN"),
            refreshTokenExpiresIn: requireEnv("JWT_REFRESH_TOKEN_EXPIRES_IN"),
        },
    };
}

/* Export singleton config - loaded once at startup */
export const config = loadConfig();
