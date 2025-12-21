import { Router } from "express";
import { AuthenticationController } from "./authentication.controller.js";
import { AuthenticationService } from "./authentication.service.js";
import { UserRepository } from "./user.repository.js";
import { SessionRepository } from "./session.repository.js";
import { requireAuth } from "./authentication.middleware.js";

interface AuthenticationRouterDependencies {
    sessionRepository: SessionRepository;
}

export function createAuthenticationRouter(deps: AuthenticationRouterDependencies): Router {
    const router = Router();

    const userRepository = new UserRepository();
    const authenticationService = new AuthenticationService(userRepository, deps.sessionRepository);
    const authenticationController = new AuthenticationController(authenticationService);

    router.post("/register", authenticationController.register);
    router.post("/login", authenticationController.login);
    router.post("/logout", authenticationController.logout);
    router.get("/profile", requireAuth, authenticationController.getProfile);

    return router;
}
