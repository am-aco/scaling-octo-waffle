import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from './http.js';

const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

export class CsrfProtection {
    generateToken(): string {
        return crypto.randomBytes(32).toString('base64url');
    }

    setCsrfCookie(res: Response, token: string): void {
        res.cookie(CSRF_COOKIE_NAME, token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
    }

    createMiddleware() {
        return (req: Request, res: Response, next: NextFunction): void => {
            const method = req.method;

            if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
                next();
                return;
            }

            const cookieToken = req.cookies[CSRF_COOKIE_NAME];
            const headerToken = req.headers[CSRF_HEADER_NAME];

            if (!cookieToken || !headerToken) {
                res.status(HTTP_STATUS.FORBIDDEN).json({
                    error: 'CSRF token missing',
                });
                return;
            }

            if (cookieToken !== headerToken) {
                res.status(HTTP_STATUS.FORBIDDEN).json({
                    error: 'CSRF token mismatch',
                });
                return;
            }

            next();
        };
    }
}
