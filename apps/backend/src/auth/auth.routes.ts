import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { UserRepository } from "./user.repository.js";

export function createAuthRouter(): Router {
    const router = Router();

    const userRepository = new UserRepository();
    const authService = new AuthService(userRepository);
    const authController = new AuthController(authService);

    router.post("/register", authController.register);

    return router;
}
