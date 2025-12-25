import type { Router, RequestHandler } from 'express';
import { Router as ExpressRouter } from 'express';
import type { EmailVerificationService } from './email-verification.service.js';
import type { EmailService } from '../infrastructure/email.service.js';
import type { UserRepository } from './user.repository.js';
import { HTTP_STATUS } from '../infrastructure/http.js';

export function createEmailVerificationRouter(
    emailVerificationService: EmailVerificationService,
    emailService: EmailService,
    userRepository: UserRepository,
    rateLimit?: RequestHandler,
): Router {
    const router = ExpressRouter();

    const resendMiddleware = rateLimit ? [rateLimit] : [];

    router.post('/verify', async (req, res) => {
        try {
            const { token } = req.body;

            if (!token || typeof token !== 'string') {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: 'Verification token is required',
                });
                return;
            }

            const result = await emailVerificationService.verifyEmail({ token });

            if (!result.success) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: result.error ?? 'Email verification failed',
                });
                return;
            }

            res.status(HTTP_STATUS.OK).json({
                message: 'Email verified successfully',
            });
        } catch (error) {
            console.error('Email verification error:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: 'Failed to verify email',
            });
        }
    });

    router.post('/resend', ...resendMiddleware, async (req, res) => {
        try {
            const { email } = req.body;

            if (!email || typeof email !== 'string') {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: 'Email is required',
                });
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: 'Invalid email format',
                });
                return;
            }

            const user = await userRepository.findByEmail(email);

            if (!user) {
                res.status(HTTP_STATUS.OK).json({
                    message: 'If an account exists with this email, a verification link has been sent',
                });
                return;
            }

            if (user.email_verified) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: 'Email is already verified',
                });
                return;
            }

            const token = await emailVerificationService.generateVerificationToken({
                userId: user.id,
                email: user.email,
            });

            await emailService.sendEmailVerification({
                to: user.email,
                verificationToken: token,
            });

            res.status(HTTP_STATUS.OK).json({
                message: 'Verification email sent successfully',
            });
        } catch (error) {
            console.error('Resend verification error:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: 'Failed to resend verification email',
            });
        }
    });

    return router;
}
