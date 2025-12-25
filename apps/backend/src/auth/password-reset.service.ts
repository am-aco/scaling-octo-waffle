import crypto from 'node:crypto';
import argon2 from 'argon2';
import { withTransaction } from '../infrastructure/database.js';
import type { UserRepository } from './user.repository.js';
import type { PasswordResetTokenRepository } from './password-reset-token.repository.js';
import type { SessionRepository } from './session.repository.js';

const TOKEN_EXPIRATION_MS = 60 * 60 * 1000; /* 1 hour */

export interface PasswordResetRequest {
    email: string;
}

export interface PasswordResetConfirmation {
    token: string;
    newPassword: string;
}

export interface PasswordResetResult {
    success: boolean;
    token?: string;
    email?: string;
}

export class PasswordResetService {
    constructor(
        private userRepository: UserRepository,
        private resetTokenRepository: PasswordResetTokenRepository,
        private sessionRepository: SessionRepository,
    ) {}

    async requestPasswordReset(data: PasswordResetRequest): Promise<PasswordResetResult> {
        const user = await this.userRepository.findByEmail(data.email);

        if (!user) {
            return { success: true };
        }

        const token = this.generateSecureToken();
        const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION_MS);

        await withTransaction(async (client) => {
            await this.resetTokenRepository.deleteUnusedByUserId(user.id, client);

            await this.resetTokenRepository.create(
                {
                    userId: user.id,
                    token,
                    expiresAt,
                },
                client,
            );
        });

        return {
            success: true,
            token,
            email: user.email,
        };
    }

    async resetPassword(data: PasswordResetConfirmation): Promise<{ success: boolean; error?: string }> {
        const resetToken = await this.resetTokenRepository.findByToken(data.token);

        if (!resetToken) {
            return { success: false, error: 'Invalid or expired reset token' };
        }

        if (resetToken.usedAt) {
            return { success: false, error: 'Reset token has already been used' };
        }

        if (resetToken.expiresAt < new Date()) {
            return { success: false, error: 'Reset token has expired' };
        }

        const passwordHash = await argon2.hash(data.newPassword, {
            type: argon2.argon2id,
            memoryCost: 19456,
            timeCost: 2,
            parallelism: 1,
        });

        await withTransaction(async (client) => {
            await this.userRepository.updatePassword(resetToken.userId, passwordHash, client);

            await this.resetTokenRepository.markAsUsed(data.token, client);

            await this.sessionRepository.deleteAllForUser(resetToken.userId, client);
        });

        return { success: true };
    }

    private generateSecureToken(): string {
        return crypto.randomBytes(32).toString('base64url');
    }
}
