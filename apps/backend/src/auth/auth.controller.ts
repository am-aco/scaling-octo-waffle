import type { Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import { ValidationError, ConflictError } from "./auth.errors.js";
import { HTTP_STATUS } from "../infrastructure/http.js";

export class AuthController {
    constructor(private authService: AuthService) { }

    /*
     * Handle POST /auth/register
     * Creates a new user account
     */
    register = async (req: Request, res: Response): Promise<void> => {
        try {
            /* Extract and validate request body */
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: "Email and password are required",
                });
                return;
            }

            const result = await this.authService.register({ email, password });

            res.status(HTTP_STATUS.CREATED).json({
                message: "User registered successfully",
                user: result,
            });
        }
        catch (error) {
            if (error instanceof ValidationError) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({ error: error.message });
                return;
            }

            if (error instanceof ConflictError) {
                res.status(HTTP_STATUS.CONFLICT).json({ error: error.message });
                return;
            }

            console.error("Registration error:", error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
        }
    };
}
