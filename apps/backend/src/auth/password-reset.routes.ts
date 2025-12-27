import type { Router, RequestHandler } from "express";
import { Router as ExpressRouter } from "express";
import { PasswordResetController } from "./password-reset.controller.js";
import type { PasswordResetService } from "./password-reset.service.js";
import type { EmailService } from "../infrastructure/email.service.js";

interface PasswordResetRouterDependencies {
    passwordResetService: PasswordResetService;
    emailService: EmailService;
    rateLimit?: RequestHandler;
}

export function createPasswordResetRouter(deps: PasswordResetRouterDependencies): Router {
    const router = ExpressRouter();

    const controller = new PasswordResetController(
        deps.passwordResetService,
        deps.emailService
    );

    const requestMiddleware = deps.rateLimit
        ? [deps.rateLimit, controller.requestReset]
        : [controller.requestReset];

    const resetMiddleware = deps.rateLimit
        ? [deps.rateLimit, controller.resetPassword]
        : [controller.resetPassword];

    router.post("/request", ...requestMiddleware);
    router.post("/reset", ...resetMiddleware);

    return router;
}
