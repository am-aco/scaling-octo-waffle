import type { Router, RequestHandler } from "express";
import { Router as ExpressRouter } from "express";
import { AuthenticationController } from "./authentication.controller.js";
import { AuthenticationService } from "./authentication.service.js";
import { UserRepository } from "./user.repository.js";
import { SessionRepository } from "./session.repository.js";
import { requireAuth } from "./authentication.middleware.js";
import type { CsrfProtection } from "../infrastructure/csrf.js";

interface AuthenticationRouterDependencies {
    sessionRepository: SessionRepository;
    loginRateLimit?: RequestHandler;
    registerRateLimit?: RequestHandler;
    csrfProtection?: CsrfProtection;
}

export function createAuthenticationRouter(deps: AuthenticationRouterDependencies): Router {
    const router = ExpressRouter();

    const userRepository = new UserRepository();
    const authenticationService = new AuthenticationService(userRepository, deps.sessionRepository);
    const authenticationController = new AuthenticationController(authenticationService, deps.csrfProtection);

    const registerMiddleware = deps.registerRateLimit
        ? [deps.registerRateLimit, authenticationController.register]
        : [authenticationController.register];

    const loginMiddleware = deps.loginRateLimit
        ? [deps.loginRateLimit, authenticationController.login]
        : [authenticationController.login];

    const csrfMiddleware = deps.csrfProtection
        ? deps.csrfProtection.createMiddleware()
        : undefined;

    const logoutMiddleware = csrfMiddleware
        ? [csrfMiddleware, authenticationController.logout]
        : [authenticationController.logout];

    router.post("/register", ...registerMiddleware);
    router.post("/login", ...loginMiddleware);
    router.post("/logout", ...logoutMiddleware);
    router.get("/profile", requireAuth, authenticationController.getProfile);

    return router;
}
