import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";
import { logger } from "./logger.js";

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
    const requestId = (req.headers["x-request-id"] as string) || crypto.randomUUID();

    req.requestId = requestId;
    req.log = logger.child({ requestId });

    res.setHeader("x-request-id", requestId);

    next();
}
