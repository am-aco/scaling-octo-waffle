export const SESSION_DURATION_DAYS = 7;

export const REMEMBER_ME_DURATION_DAYS = 30;

export const REMEMBER_ME_DURATION_MS = REMEMBER_ME_DURATION_DAYS * 24 * 60 * 60 * 1000;

export const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000,
};

export const MAX_LOGIN_ATTEMPTS = 5;

export const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
