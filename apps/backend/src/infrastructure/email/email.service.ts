import { logger } from "../logging/logger.js";

export interface PasswordResetEmail {
    to: string;
    resetToken: string;
}

export interface EmailVerificationEmail {
    to: string;
    verificationToken: string;
}

export class EmailService {
    constructor(private baseUrl: string) {}

    async sendPasswordResetEmail(data: PasswordResetEmail): Promise<void> {
        const resetUrl = `${this.baseUrl}/reset-password?token=${data.resetToken}`;

        logger.info("Password reset email sent (simulated)", {
            type: "password_reset",
            to: data.to,
            subject: "Reset Your Password",
            resetUrl,
            expiresIn: "1 hour",
        });
    }

    async sendEmailVerification(data: EmailVerificationEmail): Promise<void> {
        const verificationUrl = `${this.baseUrl}/verify-email?token=${data.verificationToken}`;

        logger.info("Email verification sent (simulated)", {
            type: "email_verification",
            to: data.to,
            subject: "Verify Your Email Address",
            verificationUrl,
            expiresIn: "24 hours",
        });
    }
}
