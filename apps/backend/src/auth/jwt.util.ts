import jwt from "jsonwebtoken";
import { config } from "../infrastructure/config.js";

/* JWT payload structure with standard claims */
export interface JwtPayload {
    sub: string; /* Subject: user ID */
    email: string; /* User email */
    iat: number; /* Issued at: timestamp */
    exp: number; /* Expires: timestamp */
}

/* Sign a JWT for a user (Phase 9A - long-lived token) */
export function signToken(userId: string, email: string): string {
    return jwt.sign(
        { sub: userId, email },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn as any }
    );
}

/* Sign a short-lived access token (Phase 9B - refresh token pattern) */
export function signAccessToken(userId: string, email: string): string {
    return jwt.sign(
        { sub: userId, email },
        config.jwt.secret,
        { expiresIn: config.jwt.accessTokenExpiresIn as any }
    );
}

/* Verify a JWT and return the decoded payload */
export function verifyToken(token: string): JwtPayload {
    try {
        const decoded = jwt.verify(token, config.jwt.secret);
        return decoded as JwtPayload;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error("Token has expired");
        }
        if (error instanceof jwt.JsonWebTokenError) {
            throw new Error("Invalid token");
        }
        throw error;
    }
}
