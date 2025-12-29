import express, { type Express, type Request, type Response, type NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
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
import { AuthenticationService } from "../auth/authentication.service.js";
import { AuthorizationService } from "../auth/authorization.service.js";
import { createRequirePermission } from "../auth/authorization.middleware.js";
import { createRequireOwnership } from "../auth/ownership.middleware.js";
import { JwtService } from "../auth/jwt.service.js";
import { TokenService } from "../auth/token.service.js";
import { UserRepository } from "../users/user.repository.js";
import { UserService } from "../users/user.service.js";
import { createUserRouter } from "../users/user.routes.js";
import { PostRepository } from "../posts/post.repository.js";
import { PostService } from "../posts/post.service.js";
import { createPostRouter } from "../posts/post.routes.js";
import { EmailService } from "./email.service.js";
import { RateLimiter } from "./rate-limiter.js";
import { pool } from "./database.js";
import { HTTP_STATUS } from "./http.js";
import { config } from "./config.js";
import { logger } from "./logger.js";
import {
    ValidationError,
    ConflictError,
    AuthenticationError,
    NotFoundError,
    ForbiddenError,
} from "./errors.js";

/* Creates and configures the Express application */
export function createServer(): Express {
    const app = express();

    if (config.trustProxy) {
        app.set("trust proxy", config.trustProxy);
    }

    app.use(helmet());

    if (config.allowedOrigins.length) {
        app.use(cors({
            origin: config.allowedOrigins,
            credentials: true,
        }));
    }

    app.use(compression({
        level: 6,
        threshold: 1024,
    }));
    app.use(express.json({ limit: "10kb" }));
    app.use(express.urlencoded({ extended: true, limit: "10kb" }));
    app.use(cookieParser());

    /* Shared repository instances (composition root) */
    const userRepository = new UserRepository();
    const sessionRepository = new SessionRepository();
    const refreshTokenRepository = new RefreshTokenRepository();
    const passwordResetTokenRepository = new PasswordResetTokenRepository();
    const emailVerificationTokenRepository = new EmailVerificationTokenRepository();
    const postRepository = new PostRepository();

    /* Shared service instances */
    const emailService = new EmailService(config.appBaseUrl);
    const authenticationService = new AuthenticationService(
        userRepository,
        sessionRepository,
    );
    const jwtService = new JwtService(userRepository);
    const tokenService = new TokenService(
        userRepository,
        refreshTokenRepository,
    );
    const passwordResetService = new PasswordResetService(
        userRepository,
        passwordResetTokenRepository,
        sessionRepository,
        emailService,
    );
    const emailVerificationService = new EmailVerificationService(
        userRepository,
        emailVerificationTokenRepository,
        emailService,
    );
    const userService = new UserService(userRepository);
    const postService = new PostService(postRepository);
    const authorizationService = new AuthorizationService();

    /* Authorization middleware factories */
    const requirePermission = createRequirePermission(authorizationService);
    const requireOwnership = createRequireOwnership(authorizationService);

    /* Rate limiter instance */
    const rateLimiter = new RateLimiter();

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

    app.get("/health", async (_req, res) => {
        const health: {
            status: "ok" | "error";
            database: "connected" | "disconnected";
            timestamp: string;
            error?: string;
        } = {
            status: "ok",
            database: "connected",
            timestamp: new Date().toISOString(),
        };

        try {
            await pool.query("SELECT 1");
        }
        catch (error) {
            health.status = "error";
            health.database = "disconnected";
            health.error = error instanceof Error ? error.message : "Unknown error";

            res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json(health);
            return;
        }

        res.status(HTTP_STATUS.OK).json(health);
    });

    /* Mount authentication routes at /auth */
    app.use("/auth", createAuthenticationRouter({
        authenticationService,
        loginRateLimit,
        registerRateLimit,
        csrfEnabled: true,
    }));

    /* Mount JWT authentication routes at /auth/jwt */
    app.use("/auth/jwt", createJwtRouter({
        jwtService,
        rateLimit: loginRateLimit,
    }));

    /* Mount refresh token routes at /auth/token */
    app.use("/auth/token", createTokenRouter({
        tokenService,
        rateLimit: loginRateLimit,
    }));

    /* Mount password reset routes at /auth/password-reset */
    app.use("/auth/password-reset", createPasswordResetRouter({
        passwordResetService,
        rateLimit: passwordResetRateLimit,
    }));

    /* Mount email verification routes at /auth/email-verification */
    app.use("/auth/email-verification", createEmailVerificationRouter({
        emailVerificationService,
        rateLimit: emailVerificationRateLimit,
    }));

    /* Mount user management routes at /users */
    app.use("/users", createUserRouter({
        userService,
        requirePermission,
        requireOwnership,
    }));

    /* Mount posts routes at /posts */
    app.use("/posts", createPostRouter({
        postService,
        requireOwnership,
    }));

    /* 404 handler for undefined routes */
    app.use((_req: Request, res: Response) => {
        res.status(HTTP_STATUS.NOT_FOUND).json({
            error: "Not found",
        });
    });

    /* Global error handler - must be last middleware */
    app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
        if (err instanceof ValidationError) {
            res.status(HTTP_STATUS.BAD_REQUEST).json({ error: err.message });
            return;
        }

        if (err instanceof ConflictError) {
            res.status(HTTP_STATUS.CONFLICT).json({ error: err.message });
            return;
        }

        if (err instanceof AuthenticationError) {
            res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: err.message });
            return;
        }

        if (err instanceof ForbiddenError) {
            res.status(HTTP_STATUS.FORBIDDEN).json({ error: err.message });
            return;
        }

        if (err instanceof NotFoundError) {
            res.status(HTTP_STATUS.NOT_FOUND).json({ error: err.message });
            return;
        }

        logger.error("Unhandled error", { error: err });
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            error: "Internal server error",
        });
    });

    return app;
}
