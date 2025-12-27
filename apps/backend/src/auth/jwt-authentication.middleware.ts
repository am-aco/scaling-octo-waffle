import type { Request, Response, NextFunction } from "express";
import { UserRepository } from "../users/user.repository.js";
import { verifyToken } from "./jwt.util.js";

/* JWT authentication middleware factory */
export function createJwtAuthMiddleware(userRepository: UserRepository) {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader) {
                return next();
            }

            /* Extract token from "Bearer <token>" format */
            const parts = authHeader.split(" ");
            if (parts.length !== 2 || parts[0] !== "Bearer") {
                return next();
            }

            const token = parts[1];
            if (!token) {
                return next();
            }

            /* Verify token signature and extract claims */
            const payload = verifyToken(token);

            /* Load user + permissions from database */
            const user = await userRepository.findByIdWithPermissions(payload.sub);

            if (!user) {
                return next();
            }

            /* Attach authenticated user to request */
            req.user = {
                id: user.id,
                email: user.email,
                permissions: user.permissions,
            };

            next();
        }
        catch (error) {
            console.error("JWT auth middleware error:", error);
            next();
        }
    };
}
