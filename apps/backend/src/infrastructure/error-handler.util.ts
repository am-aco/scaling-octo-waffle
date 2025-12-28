import type { Response } from "express";
import { HTTP_STATUS } from "./http.js";
import {
    ValidationError,
    ConflictError,
    AuthenticationError,
    NotFoundError,
    ForbiddenError,
} from "./errors.js";

export function handleControllerError(error: unknown, res: Response, context: string): void {
    if (error instanceof ValidationError) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ error: error.message });
        return;
    }

    if (error instanceof ConflictError) {
        res.status(HTTP_STATUS.CONFLICT).json({ error: error.message });
        return;
    }

    if (error instanceof AuthenticationError) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: error.message });
        return;
    }

    if (error instanceof ForbiddenError) {
        res.status(HTTP_STATUS.FORBIDDEN).json({ error: error.message });
        return;
    }

    if (error instanceof NotFoundError) {
        res.status(HTTP_STATUS.NOT_FOUND).json({ error: error.message });
        return;
    }

    console.error(`${context}:`, error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
}
