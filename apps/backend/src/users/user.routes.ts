import { Router } from "express";
import { UserController } from "./user.controller.js";
import { UserRepository } from "../auth/user.repository.js";
import { requirePermission } from "../auth/authorization.middleware.js";
import { requireOwnershipOrPermission } from "../auth/ownership.middleware.js";

export function createUserRouter(): Router {
    const router = Router();

    const userRepository = new UserRepository();
    const userController = new UserController(userRepository);

    router.post("/", requirePermission("users:create"), userController.createUser);

    router.get("/", requirePermission("users:read"), userController.getAllUsers);

    router.get(
        "/:userId",
        requireOwnershipOrPermission({
            resourceOwnerIdParam: "userId",
            bypassPermission: "users:read",
        }),
        userController.getUserById
    );

    router.put(
        "/:userId",
        requireOwnershipOrPermission({
            resourceOwnerIdParam: "userId",
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
