import type { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../infrastructure/http.js";
import { AuthorizationService } from "./authorization.service.js";

const authzService = new AuthorizationService();

export interface ResourceOwnershipConfig {
    getResourceOwnerId: (req: Request) => Promise<string | null>;
    bypassPermission?: string;
}

export function requireResourceOwnershipOrPermission(config: ResourceOwnershipConfig) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        if (!req.user) {
            res.status(HTTP_STATUS.UNAUTHORIZED).json({
                error: "Authentication required",
            });
            return;
        }

        const resourceOwnerId = await config.getResourceOwnerId(req);

        if (!resourceOwnerId) {
            res.status(HTTP_STATUS.NOT_FOUND).json({
                error: "Resource not found",
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
            reason: "You can only modify your own resources",
        });
    };
}
