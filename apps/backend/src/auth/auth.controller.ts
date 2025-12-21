import type { Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import { ValidationError, ConflictError } from "./auth.errors.js";

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
                res.status(400).json({
                    error: "Email and password are required",
                });
                return;
            }

            const result = await this.authService.register({ email, password });

            res.status(201).json({
                message: "User registered successfully",
                user: result,
            });
        }
        catch (error) {
            if (error instanceof ValidationError) {
                res.status(400).json({ error: error.message });
                return;
            }

            if (error instanceof ConflictError) {
                res.status(409).json({ error: error.message });
                return;
            }

            console.error("Registration error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    };
}
