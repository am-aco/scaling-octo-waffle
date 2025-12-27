import { Router } from "express";
import { UserController } from "./user.controller.js";
import type { UserService } from "./user.service.js";
import { requirePermission } from "../auth/authorization.middleware.js";
import { requireOwnership } from "../auth/ownership.middleware.js";

interface UserRouterDependencies {
    userService: UserService;
}

export function createUserRouter(deps: UserRouterDependencies): Router {
    const router = Router();

    const userController = new UserController(deps.userService);

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
