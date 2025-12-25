import express, { type Express } from "express";
import cookieParser from "cookie-parser";
import { createAuthenticationRouter } from "../auth/authentication.routes.js";
import { createAuthMiddleware } from "../auth/authentication.middleware.js";
import { createJwtAuthMiddleware } from "../auth/jwt-authentication.middleware.js";
import { createJwtRouter } from "../auth/jwt.routes.js";
import { createTokenRouter } from "../auth/token.routes.js";
import { SessionRepository } from "../auth/session.repository.js";
import { UserRepository } from "../auth/user.repository.js";
import { createUserRouter } from "../users/user.routes.js";
import { createPostRouter } from "../posts/post.routes.js";
import { HTTP_STATUS } from "./http.js";

/* Creates and configures the Express application */
export function createServer(): Express {
    const app = express();

    app.use(express.json());
    app.use(cookieParser());

    /* Shared repository instances */
    const sessionRepository = new SessionRepository();
    const userRepository = new UserRepository();

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

    /* Mount user management routes at /users */
    app.use("/users", createUserRouter());

    /* Mount posts routes at /posts */
    app.use("/posts", createPostRouter());

    return app;
}
