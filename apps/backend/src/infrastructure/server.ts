import express, { type Express } from "express";
import { createAuthRouter } from "../auth/auth.routes.js";
import { HTTP_STATUS } from "./http.js";

/* Creates and configures the Express application */
export function createServer(): Express {
    const app = express();

    /* Parse JSON request bodies */
    app.use(express.json());

    /* Health check endpoint - used by load balancers, container orchestration */
    app.get("/health", (_req, res) => {
        res.status(HTTP_STATUS.OK).json({ status: "ok" });
    });

    /* Mount auth routes at /auth */
    app.use("/auth", createAuthRouter());

    return app;
}
