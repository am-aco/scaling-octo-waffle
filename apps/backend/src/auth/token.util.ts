import crypto from 'node:crypto';

/* Generate a cryptographically secure random token for password reset and email verification */
export function generateSecureToken(): string {
    return crypto.randomBytes(32).toString('base64url');
}

/*
 * Hash a token using SHA-256 before storage.
 * SHA-256 is appropriate here (unlike passwords) because the input already has
 * 256 bits of entropy - brute force is computationally infeasible.
 */
export function hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}

/*
 * Generate a session ID (for database lookup) and secret (for validation).
 * Returns both components separately - they will be combined as "id.secret" for the client.
 */
export function generateSessionCredentials(): { id: string; secret: string } {
    const id = crypto.randomUUID();
    const secret = crypto.randomBytes(32).toString('base64url');
    return { id, secret };
}

/*
 * Parse a compound session token into its components.
 * Expected format: "sessionId.sessionSecret"
 */
export function parseSessionToken(token: string): { id: string; secret: string } | null {
    const parts = token.split('.');
    if (parts.length !== 2) {
        return null;
    }
    const [id, secret] = parts;
    if (!id || !secret) {
        return null;
    }
    return { id, secret };
}

/*
 * Constant-time comparison for hashed secrets to prevent timing attacks.
 */
export function secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
        return false;
    }
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
