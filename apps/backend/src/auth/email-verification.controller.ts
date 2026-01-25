import type { Request, Response } from "express";
import type { EmailVerificationService } from "./email-verification.service.js";
import { HTTP_STATUS } from "../infrastructure/http/http.js";
import { handleControllerError } from "../infrastructure/http/error-handler.util.js";
import { isValidEmail } from "./validation.util.js";

export class EmailVerificationController {
    constructor(private emailVerificationService: EmailVerificationService) {}

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
            handleControllerError(error, req, res, "Email verification error");
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

            res.status(HTTP_STATUS.OK).json({
                message: "If an account exists with this email, a verification link has been sent",
            });
        } catch (error) {
            handleControllerError(error, req, res, "Resend verification error");
        }
    };
}
