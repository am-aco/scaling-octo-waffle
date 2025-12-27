import type { Request, Response } from "express";
import type { EmailVerificationService } from "./email-verification.service.js";
import type { EmailService } from "../infrastructure/email.service.js";
import type { UserRepository } from "../users/user.repository.js";
import { HTTP_STATUS } from "../infrastructure/http.js";
import { ValidationError } from "./auth.errors.js";
import { isValidEmail } from "./validation.util.js";

export class EmailVerificationController {
    constructor(
        private emailVerificationService: EmailVerificationService,
        private emailService: EmailService,
        private userRepository: UserRepository
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

            const user = await this.userRepository.findByEmail(email);

            if (!user) {
                res.status(HTTP_STATUS.OK).json({
                    message: "If an account exists with this email, a verification link has been sent",
                });
                return;
            }

            if (user.email_verified) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: "Email is already verified",
                });
                return;
            }

            const token = await this.emailVerificationService.generateVerificationToken({
                userId: user.id,
                email: user.email,
            });

            await this.emailService.sendEmailVerification({
                to: user.email,
                verificationToken: token,
            });

            res.status(HTTP_STATUS.OK).json({
                message: "Verification email sent successfully",
            });
        } catch (error) {
            console.error("Resend verification error:", error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: "Internal server error",
            });
        }
    };
}
