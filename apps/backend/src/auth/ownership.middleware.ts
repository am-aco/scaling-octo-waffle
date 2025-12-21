import type { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../infrastructure/http.js";
import { AuthorizationService } from "./authorization.service.js";

const authzService = new AuthorizationService();

export interface OwnershipCheckConfig {
    resourceOwnerIdParam: string;
    bypassPermission?: string;
}

export function requireOwnershipOrPermission(config: OwnershipCheckConfig) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(HTTP_STATUS.UNAUTHORIZED).json({
                error: "Authentication required",
            });
            return;
        }

        const resourceOwnerId = req.params[config.resourceOwnerIdParam];

        if (!resourceOwnerId) {
            res.status(HTTP_STATUS.BAD_REQUEST).json({
                error: `Missing required parameter: ${config.resourceOwnerIdParam}`,
            });
            return;
        }

        const isOwner = req.user.id === resourceOwnerId;

        if (isOwner) {
            next();
            return;
        }

        if (config.bypassPermission) {
            const hasPermission = authzService.hasPermission(
                req.user.permissions,
                config.bypassPermission
            );

            if (hasPermission) {
                next();
                return;
            }
        }

        res.status(HTTP_STATUS.FORBIDDEN).json({
            error: "Access denied",
            reason: "You can only access your own resources",
        });
    };
}
