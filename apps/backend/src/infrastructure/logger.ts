import winston from "winston";
import { config } from "./config.js";

const { combine, timestamp, json, printf, colorize, errors } = winston.format;

/* Human-readable format for development */
const devFormat = combine(
    colorize(),
    timestamp({ format: "HH:mm:ss" }),
    errors({ stack: true }),
    printf(({ level, message, timestamp, stack, ...meta }) => {
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
        const stackStr = stack ? `\n${stack}` : "";
        return `${timestamp} ${level}: ${message}${metaStr}${stackStr}`;
    })
);

/* Structured JSON format for production */
const prodFormat = combine(
    timestamp(),
    errors({ stack: true }),
    json()
);

export const logger = winston.createLogger({
    level: config.nodeEnv === "development" ? "debug" : "info",
    format: config.nodeEnv === "production" ? prodFormat : devFormat,
    transports: [
        new winston.transports.Console(),
    ],
});
