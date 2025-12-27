import type { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../infrastructure/http.js";
import { AuthorizationService } from "./authorization.service.js";

export function requirePermission(permission: string) {
    const authzService = new AuthorizationService();

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
}

export function requireAnyPermission(permissions: string[]) {
    const authzService = new AuthorizationService();

    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(HTTP_STATUS.UNAUTHORIZED).json({
                error: "Authentication required",
            });
            return;
        }

        if (!authzService.hasAnyPermission(req.user.permissions, permissions)) {
            res.status(HTTP_STATUS.FORBIDDEN).json({
                error: "Insufficient permissions",
                required: `One of: ${permissions.join(", ")}`,
            });
            return;
        }

        next();
    };
}

export function requireAllPermissions(permissions: string[]) {
    const authzService = new AuthorizationService();

    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(HTTP_STATUS.UNAUTHORIZED).json({
                error: "Authentication required",
            });
            return;
        }

        if (!authzService.hasAllPermissions(req.user.permissions, permissions)) {
            res.status(HTTP_STATUS.FORBIDDEN).json({
                error: "Insufficient permissions",
                required: `All of: ${permissions.join(", ")}`,
            });
            return;
        }

        next();
    };
}
