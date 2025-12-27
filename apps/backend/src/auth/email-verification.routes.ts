import type { Router, RequestHandler } from "express";
import { Router as ExpressRouter } from "express";
import { EmailVerificationController } from "./email-verification.controller.js";
import type { EmailVerificationService } from "./email-verification.service.js";
import type { EmailService } from "../infrastructure/email.service.js";

interface EmailVerificationRouterDependencies {
    emailVerificationService: EmailVerificationService;
    emailService: EmailService;
    rateLimit?: RequestHandler;
}

export function createEmailVerificationRouter(deps: EmailVerificationRouterDependencies): Router {
    const router = ExpressRouter();

    const controller = new EmailVerificationController(
        deps.emailVerificationService,
        deps.emailService,
    );

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
