import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { HTTP_STATUS } from './http.js';

const CSRF_HEADER = 'x-csrf-token';


/* Middleware that validates CSRF token against session */
export function validateCsrf(req: Request, res: Response, next: NextFunction): void {
    /* Skip safe methods (read-only) */
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        next();
        return;
    }

    /* Must be authenticated to validate CSRF */
    if (!req.session) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
            error: 'Authentication required',
        });
        return;
    }

    const headerToken = req.headers[CSRF_HEADER];

    if (!headerToken) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
            error: 'CSRF token missing',
        });
        return;
    }

    if (headerToken !== req.session.csrfToken) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
            error: 'CSRF token invalid',
        });
        return;
    }

    next();
}

export function createCsrfMiddleware(enabled: boolean): RequestHandler {
    if (!enabled) {
        return (_req, _res, next) => next();
    }
    return validateCsrf;
}
