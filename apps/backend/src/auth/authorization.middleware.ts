import type { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../infrastructure/http.js";
import type { AuthorizationService } from "./authorization.service.js";

export function createRequirePermission(authzService: AuthorizationService) {
    return function requirePermission(permission: string) {
        return (req: Request, res: Response, next: NextFunction): void => {
            if (!req.user) {
                res.status(HTTP_STATUS.UNAUTHORIZED).json({
                    error: "Authentication required",
                });
                return;
            }

            if (!authzService.hasPermission(req.user.permissions, permission)) {
                res.status(HTTP_STATUS.FORBIDDEN).json({
                    error: "Insufficient permissions",
                    required: permission,
                });
                return;
            }

            next();
        };
    };
}
