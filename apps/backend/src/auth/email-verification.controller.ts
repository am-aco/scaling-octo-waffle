import type { Request, Response } from "express";
import type { EmailVerificationService } from "./email-verification.service.js";
import type { EmailService } from "../infrastructure/email.service.js";
import { HTTP_STATUS } from "../infrastructure/http.js";
import { ValidationError } from "./auth.errors.js";
import { isValidEmail } from "./validation.util.js";

export class EmailVerificationController {
    constructor(
        private emailVerificationService: EmailVerificationService,
        private emailService: EmailService,
    ) {}

    verify = async (req: Request, res: Response): Promise<void> => {
        try {
            const { token } = req.body;

            if (!token || typeof token !== "string") {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: "Verification token is required",
                });
                return;
            }

            await this.emailVerificationService.verifyEmail({ token });

            res.status(HTTP_STATUS.OK).json({
                message: "Email verified successfully",
            });
        } catch (error) {
            if (error instanceof ValidationError) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: error.message,
                });
                return;
            }
            console.error("Email verification error:", error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: "Internal server error",
            });
        }
    };

    resend = async (req: Request, res: Response): Promise<void> => {
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

            const result = await this.emailVerificationService.resendVerificationToken({ email });

            if (result.alreadyVerified) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: "Email is already verified",
                });
                return;
            }

            if (result.token && result.email) {
                await this.emailService.sendEmailVerification({
                    to: result.email,
                    verificationToken: result.token,
                });
            }

            res.status(HTTP_STATUS.OK).json({
                message: "If an account exists with this email, a verification link has been sent",
            });
        } catch (error) {
            console.error("Resend verification error:", error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: "Internal server error",
            });
        }
    };
}
