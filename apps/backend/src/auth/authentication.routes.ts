import type { Router, RequestHandler } from "express";
import { Router as ExpressRouter } from "express";
import { AuthenticationController } from "./authentication.controller.js";
import { AuthenticationService } from "./authentication.service.js";
import { UserRepository } from "./user.repository.js";
import { SessionRepository } from "./session.repository.js";
import { requireAuth } from "./authentication.middleware.js";

interface AuthenticationRouterDependencies {
    sessionRepository: SessionRepository;
    loginRateLimit?: RequestHandler;
    registerRateLimit?: RequestHandler;
}

export function createAuthenticationRouter(deps: AuthenticationRouterDependencies): Router {
    const router = ExpressRouter();

    const userRepository = new UserRepository();
    const authenticationService = new AuthenticationService(userRepository, deps.sessionRepository);
    const authenticationController = new AuthenticationController(authenticationService);

    const registerMiddleware = deps.registerRateLimit
        ? [deps.registerRateLimit, authenticationController.register]
        : [authenticationController.register];

    const loginMiddleware = deps.loginRateLimit
        ? [deps.loginRateLimit, authenticationController.login]
        : [authenticationController.login];

    router.post("/register", ...registerMiddleware);
    router.post("/login", ...loginMiddleware);
    router.post("/logout", authenticationController.logout);
    router.get("/profile", requireAuth, authenticationController.getProfile);

    return router;
}
