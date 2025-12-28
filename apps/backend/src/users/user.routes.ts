import { Router, type RequestHandler } from "express";
import { UserController } from "./user.controller.js";
import type { UserService } from "./user.service.js";
import type { OwnershipConfig } from "../auth/ownership.middleware.js";

type RequirePermission = (permission: string) => RequestHandler;
type RequireOwnership = (config: OwnershipConfig) => RequestHandler;

interface UserRouterDependencies {
    userService: UserService;
    requirePermission: RequirePermission;
    requireOwnership: RequireOwnership;
}

export function createUserRouter(deps: UserRouterDependencies): Router {
    const router = Router();

    const userController = new UserController(deps.userService);
    const { requirePermission, requireOwnership } = deps;

    router.post("/", requirePermission("users:create"), userController.createUser);

    router.get("/", requirePermission("users:read"), userController.getAllUsers);

    router.get(
        "/:userId",
        requireOwnership({
            ownerId: "userId",
            bypassPermission: "users:read",
        }),
        userController.getUserById
    );

    router.put(
        "/:userId",
        requireOwnership({
            ownerId: "userId",
            bypassPermission: "users:update",
        }),
        userController.updateUser
    );

    router.delete(
        "/:userId",
        requirePermission("users:delete"),
        userController.deleteUser
    );

    return router;
}
