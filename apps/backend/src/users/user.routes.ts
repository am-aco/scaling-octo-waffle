import { Router } from "express";
import { UserController } from "./user.controller.js";
import type { UserRepository } from "./user.repository.js";
import { requirePermission } from "../auth/authorization.middleware.js";
import { requireOwnership } from "../auth/ownership.middleware.js";

interface UserRouterDependencies {
    userRepository: UserRepository;
}

export function createUserRouter(deps: UserRouterDependencies): Router {
    const router = Router();

    const userController = new UserController(deps.userRepository);

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
