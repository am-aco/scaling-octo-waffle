import { Router, type RequestHandler } from "express";
import { AuthenticationController } from "./authentication.controller.js";
import type { AuthenticationService } from "./authentication.service.js";
import { requireAuth } from "./authentication.middleware.js";
import { validateCsrf } from "../infrastructure/csrf.js";

interface AuthenticationRouterDependencies {
    authenticationService: AuthenticationService;
    loginRateLimit?: RequestHandler;
    registerRateLimit?: RequestHandler;
    csrfEnabled?: boolean;
}

export function createAuthenticationRouter(deps: AuthenticationRouterDependencies): Router {
    const router = Router();

    const authenticationController = new AuthenticationController(deps.authenticationService);

    const registerMiddleware: RequestHandler[] = deps.registerRateLimit
        ? [deps.registerRateLimit, authenticationController.register]
        : [authenticationController.register];

    const loginMiddleware: RequestHandler[] = deps.loginRateLimit
        ? [deps.loginRateLimit, authenticationController.login]
        : [authenticationController.login];

    /* CSRF validation for logout (state-changing request after login) */
    const logoutMiddleware: RequestHandler[] = deps.csrfEnabled
        ? [validateCsrf, authenticationController.logout]
        : [authenticationController.logout];

    router.post("/register", ...registerMiddleware);
    router.post("/login", ...loginMiddleware);
    router.post("/logout", ...logoutMiddleware);
    router.get("/profile", requireAuth, authenticationController.getProfile);

    return router;
}
