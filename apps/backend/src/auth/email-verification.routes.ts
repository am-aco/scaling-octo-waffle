import { Router, type RequestHandler } from "express";
import { EmailVerificationController } from "./email-verification.controller.js";
import type { EmailVerificationService } from "./email-verification.service.js";

interface EmailVerificationRouterDependencies {
    emailVerificationService: EmailVerificationService;
    rateLimit?: RequestHandler;
}

export function createEmailVerificationRouter(deps: EmailVerificationRouterDependencies): Router {
    const router = Router();

    const controller = new EmailVerificationController(deps.emailVerificationService);

    const verifyMiddleware = deps.rateLimit
        ? [deps.rateLimit, controller.verify]
        : [controller.verify];

    const resendMiddleware = deps.rateLimit
        ? [deps.rateLimit, controller.resend]
        : [controller.resend];

    router.post("/verify", ...verifyMiddleware);
    router.post("/resend", ...resendMiddleware);

    return router;
}
