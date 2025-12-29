import type { Request, Response, NextFunction } from "express";
import { SessionRepository, type SessionUser } from "./session.repository.js";
import { HTTP_STATUS } from "../infrastructure/http.js";
import { SESSION_COOKIE_NAME } from "./auth.constants.js";
import { logger } from "../infrastructure/logger.js";

export interface SessionData {
    user: SessionUser;
    csrfToken: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: SessionUser;
            session?: SessionData;
        }
    }
}

export function createAuthMiddleware(sessionRepository: SessionRepository) {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        try {
            const sessionId = req.cookies[SESSION_COOKIE_NAME];

            if (!sessionId) {
                return next();
            }

            const session = await sessionRepository.findById(sessionId);

            if (!session) {
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
            };

            next();
        }
        catch (error) {
            logger.error("Auth middleware error", { error });
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
