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
import { RefreshTokenRepository } from "../auth/refresh-token.repository.js";
import { PasswordResetTokenRepository } from "../auth/password-reset-token.repository.js";
import { PasswordResetService } from "../auth/password-reset.service.js";
import { EmailVerificationTokenRepository } from "../auth/email-verification-token.repository.js";
import { EmailVerificationService } from "../auth/email-verification.service.js";
import { UserRepository } from "../users/user.repository.js";
import { createUserRouter } from "../users/user.routes.js";
import { PostRepository } from "../posts/post.repository.js";
import { createPostRouter } from "../posts/post.routes.js";
import { EmailService } from "./email.service.js";
import { RateLimiter } from "./rate-limiter.js";
import { CsrfProtection } from "./csrf.js";
import { HTTP_STATUS } from "./http.js";

/* Creates and configures the Express application */
export function createServer(): Express {
    const app = express();

    app.use(express.json());
    app.use(cookieParser());

    /* Shared repository instances (composition root) */
    const userRepository = new UserRepository();
    const sessionRepository = new SessionRepository();
    const refreshTokenRepository = new RefreshTokenRepository();
    const passwordResetTokenRepository = new PasswordResetTokenRepository();
    const emailVerificationTokenRepository = new EmailVerificationTokenRepository();
    const postRepository = new PostRepository();

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

    /* Rate limiter instance */
    const rateLimiter = new RateLimiter();

    /* CSRF protection instance */
    const csrfProtection = new CsrfProtection();

    /* Rate limiting middleware for different endpoints */
    const loginRateLimit = rateLimiter.createMiddleware({
        max: 5,
        windowMs: 15 * 60 * 1000, /* 5 attempts per 15 minutes */
    });

    const registerRateLimit = rateLimiter.createMiddleware({
        max: 3,
        windowMs: 60 * 60 * 1000, /* 3 attempts per hour */
    });

    const passwordResetRateLimit = rateLimiter.createMiddleware({
        max: 3,
        windowMs: 60 * 60 * 1000, /* 3 attempts per hour */
    });

    const emailVerificationRateLimit = rateLimiter.createMiddleware({
        max: 3,
        windowMs: 60 * 60 * 1000, /* 3 attempts per hour */
    });

    /* Attach authenticated user to request (supports both session and JWT) */
    app.use(createAuthMiddleware(sessionRepository));
    app.use(createJwtAuthMiddleware(userRepository));

    app.get("/health", (_req, res) => {
        res.status(HTTP_STATUS.OK).json({ status: "ok" });
    });

    /* Mount authentication routes at /auth */
    app.use("/auth", createAuthenticationRouter({
        userRepository,
        sessionRepository,
        loginRateLimit,
        registerRateLimit,
        csrfProtection,
    }));

    /* Mount JWT authentication routes at /auth/jwt */
    app.use("/auth/jwt", createJwtRouter({
        userRepository,
        rateLimit: loginRateLimit,
    }));

    /* Mount refresh token routes at /auth/token */
    app.use("/auth/token", createTokenRouter({
        userRepository,
        refreshTokenRepository,
        rateLimit: loginRateLimit,
    }));

    /* Mount password reset routes at /auth/password-reset */
    app.use("/auth/password-reset", createPasswordResetRouter({
        passwordResetService,
        emailService,
        rateLimit: passwordResetRateLimit,
    }));

    /* Mount email verification routes at /auth/email-verification */
    app.use("/auth/email-verification", createEmailVerificationRouter({
        emailVerificationService,
        emailService,
        userRepository,
        rateLimit: emailVerificationRateLimit,
    }));

    /* Mount user management routes at /users */
    app.use("/users", createUserRouter({ userRepository }));

    /* Mount posts routes at /posts */
    app.use("/posts", createPostRouter({ postRepository }));

    return app;
}
