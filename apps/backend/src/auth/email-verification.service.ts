import { withTransaction } from '../infrastructure/database.js';
import type { UserRepository } from '../users/user.repository.js';
import type { EmailVerificationTokenRepository } from './email-verification-token.repository.js';
import { ValidationError } from './auth.errors.js';
import { generateSecureToken } from './token.util.js';

const TOKEN_EXPIRATION_MS = 24 * 60 * 60 * 1000; /* 24 hours */

export interface SendVerificationEmailData {
    userId: string;
    email: string;
}

export interface VerifyEmailData {
    token: string;
}

export interface ResendVerificationData {
    email: string;
}

export interface ResendVerificationResult {
    success: boolean;
    token?: string;
    email?: string;
    alreadyVerified?: boolean;
}

export class EmailVerificationService {
    constructor(
        private userRepository: UserRepository,
        private verificationTokenRepository: EmailVerificationTokenRepository,
    ) {}

    async generateVerificationToken(data: SendVerificationEmailData): Promise<string> {
        const token = generateSecureToken();
        const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION_MS);

        await withTransaction(async (client) => {
            await this.verificationTokenRepository.deleteUnusedByUserId(data.userId, client);

            await this.verificationTokenRepository.create(
                {
                    user_id: data.userId,
                    token,
                    expires_at: expiresAt,
                },
                client,
            );
        });

        return token;
    }

    async verifyEmail(data: VerifyEmailData): Promise<void> {
        const verificationToken = await this.verificationTokenRepository.findByToken(data.token);

        if (!verificationToken) {
            throw new ValidationError('Invalid or expired verification token');
        }

        if (verificationToken.used_at) {
            throw new ValidationError('Email has already been verified');
        }

        if (verificationToken.expires_at < new Date()) {
            throw new ValidationError('Verification token has expired');
        }

        await withTransaction(async (client) => {
            await this.userRepository.markEmailAsVerified(verificationToken.user_id, client);

            await this.verificationTokenRepository.markAsUsed(data.token, client);
        });
    }

    async resendVerificationToken(data: ResendVerificationData): Promise<ResendVerificationResult> {
        const user = await this.userRepository.findByEmail(data.email);

        if (!user) {
            return { success: true };
        }

        if (user.email_verified) {
            return { success: false, alreadyVerified: true };
        }

        const token = await this.generateVerificationToken({
            userId: user.id,
            email: user.email,
        });

        return {
            success: true,
            token,
            email: user.email,
        };
    }
}
