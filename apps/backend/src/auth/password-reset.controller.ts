import type { Request, Response } from "express";
import type { PasswordResetService } from "./password-reset.service.js";
import { HTTP_STATUS } from "../infrastructure/http/http.js";
import { handleControllerError } from "../infrastructure/http/error-handler.util.js";
import { isValidEmail, isValidPassword } from "./validation.util.js";

export class PasswordResetController {
    constructor(private passwordResetService: PasswordResetService) {}

    requestReset = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email } = req.body;

            if (!email || typeof email !== "string") {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: "Email is required",
                });
                return;
            }

            if (!isValidEmail(email)) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: "Invalid email format",
                });
                return;
            }

            await this.passwordResetService.requestPasswordReset({ email });

            res.status(HTTP_STATUS.OK).json({
                message: "If an account exists with this email, a password reset link has been sent",
            });
        } catch (error) {
            handleControllerError(error, req, res, "Password reset request error");
        }
    };

    validateToken = async (req: Request, res: Response): Promise<void> => {
        try {
            const { token } = req.body;

            if (!token || typeof token !== "string") {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: "Reset token is required",
                });
                return;
            }

            await this.passwordResetService.validateToken(token);

            res.status(HTTP_STATUS.OK).json({
                valid: true,
            });
        } catch (error) {
            handleControllerError(error, req, res, "Token validation error");
        }
    };

    resetPassword = async (req: Request, res: Response): Promise<void> => {
        try {
            const { token, newPassword } = req.body;

            if (!token || typeof token !== "string") {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: "Reset token is required",
                });
                return;
            }

            if (!newPassword || typeof newPassword !== "string") {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: "New password is required",
                });
                return;
            }

            if (!isValidPassword(newPassword)) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: "Password must be at least 8 characters",
                });
                return;
            }

            await this.passwordResetService.resetPassword({
                token,
                newPassword,
            });

            res.status(HTTP_STATUS.OK).json({
                message: "Password has been reset successfully. Please log in with your new password.",
            });
        } catch (error) {
            handleControllerError(error, req, res, "Password reset error");
        }
    };
}
