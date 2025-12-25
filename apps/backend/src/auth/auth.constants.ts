export const SESSION_DURATION_DAYS = 7;

export const SESSION_DURATION_MS = SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000;

export const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: SESSION_DURATION_MS,
};

export const MAX_LOGIN_ATTEMPTS = 5;

export const LOCKOUT_DURATION_MINUTES = 15;

export const LOCKOUT_DURATION_MS = LOCKOUT_DURATION_MINUTES * 60 * 1000;
