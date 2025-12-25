import crypto from 'node:crypto';
import { withTransaction } from '../infrastructure/database.js';
import type { UserRepository } from './user.repository.js';
import type { EmailVerificationTokenRepository } from './email-verification-token.repository.js';

const TOKEN_EXPIRATION_MS = 24 * 60 * 60 * 1000; /* 24 hours */

export interface SendVerificationEmailData {
    userId: string;
    email: string;
}

export interface VerifyEmailData {
    token: string;
}

export class EmailVerificationService {
    constructor(
        private userRepository: UserRepository,
        private verificationTokenRepository: EmailVerificationTokenRepository,
    ) {}

    async generateVerificationToken(data: SendVerificationEmailData): Promise<string> {
        const token = this.generateSecureToken();
        const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION_MS);

        await withTransaction(async (client) => {
            await this.verificationTokenRepository.deleteUnusedByUserId(data.userId, client);

            await this.verificationTokenRepository.create(
                {
                    userId: data.userId,
                    token,
                    expiresAt,
                },
                client,
            );
        });

        return token;
    }

    async verifyEmail(data: VerifyEmailData): Promise<{ success: boolean; error?: string }> {
        const verificationToken = await this.verificationTokenRepository.findByToken(data.token);

        if (!verificationToken) {
            return { success: false, error: 'Invalid or expired verification token' };
        }

        if (verificationToken.usedAt) {
            return { success: false, error: 'Email has already been verified' };
        }

        if (verificationToken.expiresAt < new Date()) {
            return { success: false, error: 'Verification token has expired' };
        }

        await withTransaction(async (client) => {
            await this.userRepository.markEmailAsVerified(verificationToken.userId, client);

            await this.verificationTokenRepository.markAsUsed(data.token, client);
        });

        return { success: true };
    }

    private generateSecureToken(): string {
        return crypto.randomBytes(32).toString('base64url');
    }
}
