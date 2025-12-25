import { Router } from 'express';
import type { PasswordResetService } from './password-reset.service.js';
import type { EmailService } from '../infrastructure/email.service.js';
import { HTTP_STATUS } from '../infrastructure/http.js';

export function createPasswordResetRouter(
    passwordResetService: PasswordResetService,
    emailService: EmailService,
): Router {
    const router = Router();

    router.post('/request', async (req, res) => {
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

            const result = await passwordResetService.requestPasswordReset({ email });

            if (result.token && result.email) {
                await emailService.sendPasswordResetEmail({
                    to: result.email,
                    resetToken: result.token,
                });
            }

            res.status(HTTP_STATUS.OK).json({
                message: 'If an account exists with this email, a password reset link has been sent',
            });
        } catch (error) {
            console.error('Password reset request error:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: 'Failed to process password reset request',
            });
        }
    });

    router.post('/reset', async (req, res) => {
        try {
            const { token, newPassword } = req.body;

            if (!token || typeof token !== 'string') {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: 'Reset token is required',
                });
                return;
            }

            if (!newPassword || typeof newPassword !== 'string') {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: 'New password is required',
                });
                return;
            }

            if (newPassword.length < 8) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: 'Password must be at least 8 characters',
                });
                return;
            }

            const result = await passwordResetService.resetPassword({
                token,
                newPassword,
            });

            if (!result.success) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: result.error ?? 'Password reset failed',
                });
                return;
            }

            res.status(HTTP_STATUS.OK).json({
                message: 'Password has been reset successfully. Please log in with your new password.',
            });
        } catch (error) {
            console.error('Password reset error:', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: 'Failed to reset password',
            });
        }
    });

    return router;
}
