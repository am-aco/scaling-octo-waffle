import { withTransaction } from '../infrastructure/database.js';
import type { UserRepository } from '../users/user.repository.js';
import type { PasswordResetTokenRepository } from './password-reset-token.repository.js';
import type { SessionRepository } from './session.repository.js';
import { ValidationError } from './auth.errors.js';
import { hashPassword } from './password.util.js';
import { generateSecureToken } from './token.util.js';

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

        const token = generateSecureToken();
        const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION_MS);

        await withTransaction(async (client) => {
            await this.resetTokenRepository.deleteUnusedByUserId(user.id, client);

            await this.resetTokenRepository.create(
                {
                    user_id: user.id,
                    token,
                    expires_at: expiresAt,
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

    async resetPassword(data: PasswordResetConfirmation): Promise<void> {
        const resetToken = await this.resetTokenRepository.findByToken(data.token);

        if (!resetToken) {
            throw new ValidationError('Invalid or expired reset token');
        }

        if (resetToken.used_at) {
            throw new ValidationError('Reset token has already been used');
        }

        if (resetToken.expires_at < new Date()) {
            throw new ValidationError('Reset token has expired');
        }

        const passwordHash = await hashPassword(data.newPassword);

        await withTransaction(async (client) => {
            await this.userRepository.updatePassword(resetToken.user_id, passwordHash, client);

            await this.resetTokenRepository.markAsUsed(data.token, client);

            await this.sessionRepository.deleteAllForUser(resetToken.user_id, client);
        });
    }
}
