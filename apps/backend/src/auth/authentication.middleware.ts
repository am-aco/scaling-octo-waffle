import type { Request, Response, NextFunction } from "express";
import type { Logger } from "winston";
import { SessionRepository, type SessionUser } from "./session.repository.js";
import { HTTP_STATUS } from "../infrastructure/http.js";
import { SESSION_COOKIE_NAME } from "./auth.constants.js";
import { parseSessionToken, hashToken, secureCompare } from "./token.util.js";

export interface SessionData {
    user: SessionUser;
    csrfToken: string;
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
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
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
            };

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
