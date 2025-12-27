import type { Router, RequestHandler } from "express";
import { Router as ExpressRouter } from "express";
import { AuthenticationController } from "./authentication.controller.js";
import type { AuthenticationService } from "./authentication.service.js";
import { requireAuth } from "./authentication.middleware.js";
import type { CsrfProtection } from "../infrastructure/csrf.js";

interface AuthenticationRouterDependencies {
    authenticationService: AuthenticationService;
    loginRateLimit?: RequestHandler;
    registerRateLimit?: RequestHandler;
    csrfProtection?: CsrfProtection;
}

export function createAuthenticationRouter(deps: AuthenticationRouterDependencies): Router {
    const router = ExpressRouter();

    const authenticationController = new AuthenticationController(deps.authenticationService, deps.csrfProtection);

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
