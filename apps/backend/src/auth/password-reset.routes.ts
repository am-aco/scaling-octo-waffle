import { Router, type RequestHandler } from "express";
import { PasswordResetController } from "./password-reset.controller.js";
import type { PasswordResetService } from "./password-reset.service.js";

interface PasswordResetRouterDependencies {
    passwordResetService: PasswordResetService;
    rateLimit?: RequestHandler;
}

export function createPasswordResetRouter(deps: PasswordResetRouterDependencies): Router {
    const router = Router();

    const controller = new PasswordResetController(deps.passwordResetService);

    const requestMiddleware = deps.rateLimit
        ? [deps.rateLimit, controller.requestReset]
        : [controller.requestReset];

    const resetMiddleware = deps.rateLimit
        ? [deps.rateLimit, controller.resetPassword]
        : [controller.resetPassword];

    router.post("/request", ...requestMiddleware);
    router.post("/validate", controller.validateToken);
    router.post("/reset", ...resetMiddleware);

    return router;
}
