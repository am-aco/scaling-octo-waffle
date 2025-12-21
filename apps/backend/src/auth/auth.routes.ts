import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { UserRepository } from "./user.repository.js";
import { SessionRepository } from "./session.repository.js";

interface AuthRouterDependencies {
    sessionRepository: SessionRepository;
}

export function createAuthRouter(deps: AuthRouterDependencies): Router {
    const router = Router();

    const userRepository = new UserRepository();
    const authService = new AuthService(userRepository, deps.sessionRepository);
    const authController = new AuthController(authService);

    router.post("/register", authController.register);
    router.post("/login", authController.login);
    router.post("/logout", authController.logout);

    return router;
}
