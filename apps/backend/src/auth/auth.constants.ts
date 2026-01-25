import { config } from "../infrastructure/config/config.js";

export const SESSION_COOKIE_NAME = "sid";

export const SESSION_DURATION_DAYS = 7;

export const REMEMBER_ME_DURATION_DAYS = 30;

export const REMEMBER_ME_DURATION_MS = REMEMBER_ME_DURATION_DAYS * 24 * 60 * 60 * 1000;

export const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "strict" as const,
    /* Default to session cookie (expires when browser closes) */
    maxAge: undefined as number | undefined,
};

export const MAX_LOGIN_ATTEMPTS = 5;

export const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
