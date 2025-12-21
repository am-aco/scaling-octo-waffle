import type { Request, Response, NextFunction } from "express";
import { SessionRepository, type SessionUser } from "./session.repository.js";
import { HTTP_STATUS } from "../infrastructure/http.js";

declare global {
    namespace Express {
        interface Request {
            user?: SessionUser;
        }
    }
}

export function createAuthMiddleware(sessionRepository: SessionRepository) {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        try {
            const sessionId = req.cookies.sessionId;

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
            };

            next();
        }
        catch (error) {
            console.error("Auth middleware error:", error);
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
