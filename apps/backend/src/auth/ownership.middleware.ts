import type { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../infrastructure/http.js";
import { AuthorizationService } from "./authorization.service.js";

type OwnerIdResolver = string | ((req: Request) => Promise<string | null>);

export interface OwnershipConfig {
    ownerId: OwnerIdResolver;
    bypassPermission?: string;
}

function isParamName(resolver: OwnerIdResolver): resolver is string {
    return typeof resolver === "string";
}

export function requireOwnership(config: OwnershipConfig) {
    const authzService = new AuthorizationService();

    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        if (!req.user) {
            res.status(HTTP_STATUS.UNAUTHORIZED).json({
                error: "Authentication required",
            });
            return;
        }

        let resourceOwnerId: string | null;

        if (isParamName(config.ownerId)) {
            resourceOwnerId = req.params[config.ownerId] ?? null;

            if (!resourceOwnerId) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: `Missing required parameter: ${config.ownerId}`,
                });
                return;
            }
        } else {
            resourceOwnerId = await config.ownerId(req);

            if (!resourceOwnerId) {
                res.status(HTTP_STATUS.NOT_FOUND).json({
                    error: "Resource not found",
                });
                return;
            }
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
