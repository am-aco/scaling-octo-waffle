import express, { type Express } from "express";
import cookieParser from "cookie-parser";
import { createAuthenticationRouter } from "../auth/authentication.routes.js";
import { createAuthMiddleware } from "../auth/authentication.middleware.js";
import { createJwtAuthMiddleware } from "../auth/jwt-authentication.middleware.js";
import { createJwtRouter } from "../auth/jwt.routes.js";
import { createTokenRouter } from "../auth/token.routes.js";
import { createPasswordResetRouter } from "../auth/password-reset.routes.js";
import { createEmailVerificationRouter } from "../auth/email-verification.routes.js";
import { SessionRepository } from "../auth/session.repository.js";
import { UserRepository } from "../auth/user.repository.js";
import { PasswordResetTokenRepository } from "../auth/password-reset-token.repository.js";
import { PasswordResetService } from "../auth/password-reset.service.js";
import { EmailVerificationTokenRepository } from "../auth/email-verification-token.repository.js";
import { EmailVerificationService } from "../auth/email-verification.service.js";
import { createUserRouter } from "../users/user.routes.js";
import { createPostRouter } from "../posts/post.routes.js";
import { EmailService } from "./email.service.js";
import { pool } from "./database.js";
import { HTTP_STATUS } from "./http.js";

/* Creates and configures the Express application */
export function createServer(): Express {
    const app = express();

    app.use(express.json());
    app.use(cookieParser());

    /* Shared repository instances */
    const sessionRepository = new SessionRepository();
    const userRepository = new UserRepository();
    const passwordResetTokenRepository = new PasswordResetTokenRepository(pool);
    const emailVerificationTokenRepository = new EmailVerificationTokenRepository(pool);

    /* Shared service instances */
    const emailService = new EmailService('http://localhost:3000');
    const passwordResetService = new PasswordResetService(
        userRepository,
        passwordResetTokenRepository,
        sessionRepository,
    );
    const emailVerificationService = new EmailVerificationService(
        userRepository,
        emailVerificationTokenRepository,
    );

    /* Attach authenticated user to request (supports both session and JWT) */
    app.use(createAuthMiddleware(sessionRepository));
    app.use(createJwtAuthMiddleware(userRepository));

    app.get("/health", (_req, res) => {
        res.status(HTTP_STATUS.OK).json({ status: "ok" });
    });

    /* Mount authentication routes at /auth */
    app.use("/auth", createAuthenticationRouter({ sessionRepository }));

    /* Mount JWT authentication routes at /auth/jwt */
    app.use("/auth/jwt", createJwtRouter());

    /* Mount refresh token routes at /auth/token */
    app.use("/auth/token", createTokenRouter());

    /* Mount password reset routes at /auth/password-reset */
    app.use("/auth/password-reset", createPasswordResetRouter(passwordResetService, emailService));

    /* Mount email verification routes at /auth/email-verification */
    app.use("/auth/email-verification", createEmailVerificationRouter(emailVerificationService, emailService, userRepository));

    /* Mount user management routes at /users */
    app.use("/users", createUserRouter());

    /* Mount posts routes at /posts */
    app.use("/posts", createPostRouter());

    return app;
}
