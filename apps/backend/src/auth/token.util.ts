import crypto from 'node:crypto';

/* Generate a cryptographically secure random token for password reset and email verification */
export function generateSecureToken(): string {
    return crypto.randomBytes(32).toString('base64url');
}
