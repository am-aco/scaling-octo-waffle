import type { Request, Response, NextFunction } from "express";
import type { Logger } from "winston";
import { SessionRepository, type SessionUser } from "./session.repository.js";
import { HTTP_STATUS } from "../infrastructure/http.js";
import { SESSION_COOKIE_NAME, COOKIE_OPTIONS, REMEMBER_ME_DURATION_MS, REMEMBER_ME_DURATION_DAYS } from "./auth.constants.js";
import { parseSessionToken, hashToken, secureCompare } from "./token.util.js";

export interface SessionData {
    user: SessionUser;
    csrfToken: string;
    isRememberMe: boolean;
}

declare global {
    namespace Express {
        interface Request {
            user?: SessionUser;
            session?: SessionData;
            requestId: string;
            log: Logger;
        }
    }
}

export function createAuthMiddleware(sessionRepository: SessionRepository) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const sessionToken = req.cookies[SESSION_COOKIE_NAME];

            if (!sessionToken) {
                return next();
            }

            const parsed = parseSessionToken(sessionToken);

            if (!parsed) {
                return next();
            }

            const session = await sessionRepository.findById(parsed.id);

            if (!session) {
                return next();
            }

            const providedSecretHash = hashToken(parsed.secret);
            if (!secureCompare(providedSecretHash, session.secret_hash)) {
                return next();
            }

            req.user = {
                id: session.user.id,
                email: session.user.email,
                permissions: session.user.permissions,
            };

            req.session = {
                user: session.user,
                csrfToken: session.csrf_token,
                isRememberMe: session.is_remember_me,
            };

            /* Sliding expiration for "Remember Me" sessions
               Only extend when past 50% of duration to reduce database writes */
            if (session.is_remember_me) {
                const now = new Date();
                const expiresAt = new Date(session.expires_at);
                const halfDurationMs = REMEMBER_ME_DURATION_MS / 2;
                const timeUntilExpiry = expiresAt.getTime() - now.getTime();

                /* Only refresh if less than half the duration remains */
                if (timeUntilExpiry < halfDurationMs) {
                    const newExpiresAt = new Date();
                    newExpiresAt.setDate(newExpiresAt.getDate() + REMEMBER_ME_DURATION_DAYS);

                    /* Update database expiration asynchronously to avoid blocking the request */
                    sessionRepository.updateExpiration(session.id, newExpiresAt).catch((err) => {
                        req.log.error("Failed to update session expiration", {
                            sessionId: session.id,
                            error: err,
                        });
                    });

                    /* Refresh the session cookie with updated maxAge */
                    const cookieOptions = {
                        ...COOKIE_OPTIONS,
                        maxAge: REMEMBER_ME_DURATION_MS,
                    };
                    res.cookie(SESSION_COOKIE_NAME, sessionToken, cookieOptions);
                }
            }

            next();
        }
        catch (error) {
            req.log.error("Auth middleware error", { error });
            next();
        }
    };
}

export function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    if (!req.user) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
            error: "Authentication required",
        });
        return;
    }

    next();
}
