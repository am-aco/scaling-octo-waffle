import express, { type Express } from "express";
import cookieParser from "cookie-parser";
import { createAuthRouter } from "../auth/auth.routes.js";
import { createAuthMiddleware } from "../auth/auth.middleware.js";
import { SessionRepository } from "../auth/session.repository.js";
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

    /* Mount auth routes at /auth */
    app.use("/auth", createAuthRouter({ sessionRepository }));

    return app;
}
