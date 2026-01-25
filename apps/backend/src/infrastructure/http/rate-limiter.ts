import type { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from './http.js';
import { config as appConfig } from '../config/config.js';

interface RateLimitConfig {
    max: number;
    windowMs: number;
}

export class RateLimiter {
    private requests: Map<string, number[]> = new Map();

    createMiddleware(config: RateLimitConfig) {
        return (req: Request, res: Response, next: NextFunction): void => {
            /* Bypass rate limiting in development */
            if (appConfig.nodeEnv === 'development') {
                next();
                return;
            }

            const ip = req.ip || req.socket.remoteAddress || 'unknown';
            const endpoint = req.path;
            const key = `${ip}:${endpoint}`;
            const now = Date.now();
            const windowStart = now - config.windowMs;

            let timestamps = this.requests.get(key) || [];

            timestamps = timestamps.filter(timestamp => timestamp > windowStart);

            if (timestamps.length >= config.max) {
                const oldestTimestamp = timestamps[0];
                const retryAfter = oldestTimestamp ? Math.ceil((oldestTimestamp + config.windowMs - now) / 1000) : 60;

                res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
                    error: 'Too many requests. Please try again later.',
                    retryAfter,
                });
                return;
            }

            timestamps.push(now);
            this.requests.set(key, timestamps);

            next();
        };
    }
}
