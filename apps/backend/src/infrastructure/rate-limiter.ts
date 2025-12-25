import type { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from './http.js';

interface RateLimitConfig {
    max: number;
    windowMs: number;
}

export class RateLimiter {
    private requests: Map<string, number[]> = new Map();

    createMiddleware(config: RateLimitConfig) {
        return (req: Request, res: Response, next: NextFunction): void => {
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

    cleanup(): void {
        const now = Date.now();
        const maxWindow = 60 * 60 * 1000;

        for (const [key, timestamps] of this.requests.entries()) {
            const filtered = timestamps.filter(timestamp => timestamp > now - maxWindow);

            if (filtered.length === 0) {
                this.requests.delete(key);
            } else {
                this.requests.set(key, filtered);
            }
        }
    }

    getStats(): { totalKeys: number; totalRequests: number } {
        let totalRequests = 0;
        for (const timestamps of this.requests.values()) {
            totalRequests += timestamps.length;
        }
        return {
            totalKeys: this.requests.size,
            totalRequests,
        };
    }
}
