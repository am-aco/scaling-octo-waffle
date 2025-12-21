import type { Request, Response, NextFunction } from "express";
import { SessionRepository, type SessionUser } from "./session.repository.js";

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
