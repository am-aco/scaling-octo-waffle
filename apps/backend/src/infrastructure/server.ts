import express, { type Express } from "express";
import cookieParser from "cookie-parser";
import { createAuthenticationRouter } from "../auth/authentication.routes.js";
import { createAuthMiddleware } from "../auth/authentication.middleware.js";
import { SessionRepository } from "../auth/session.repository.js";
import { createUserRouter } from "../users/user.routes.js";
import { HTTP_STATUS } from "./http.js";

/* Creates and configures the Express application */
export function createServer(): Express {
    const app = express();

    app.use(express.json());
    app.use(cookieParser());

    /* Shared repository instance for session operations */
    const sessionRepository = new SessionRepository();

    /* Attach authenticated user to request if valid session exists */
    app.use(createAuthMiddleware(sessionRepository));

    app.get("/health", (_req, res) => {
        res.status(HTTP_STATUS.OK).json({ status: "ok" });
    });

    /* Mount authentication routes at /auth */
    app.use("/auth", createAuthenticationRouter({ sessionRepository }));

    /* Mount user management routes at /users */
    app.use("/users", createUserRouter());

    return app;
}
