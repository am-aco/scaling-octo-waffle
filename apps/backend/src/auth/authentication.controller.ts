import type { Request, Response } from "express";
import { AuthenticationService } from "./authentication.service.js";
import { ValidationError, ConflictError } from "./auth.errors.js";
import { HTTP_STATUS } from "../infrastructure/http.js";
import { COOKIE_OPTIONS } from "./auth.constants.js";

export class AuthenticationController {
    constructor(private authenticationService: AuthenticationService) { }

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

            const result = await this.authenticationService.register({ email, password });

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

    /*
     * Handle POST /auth/login
     * Authenticates user and creates session
     */
    login = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: "Email and password are required",
                });
                return;
            }

            const result = await this.authenticationService.login({ email, password });

            res.cookie("sessionId", result.session.id, COOKIE_OPTIONS);

            res.status(HTTP_STATUS.OK).json({
                message: "Login successful",
                user: result.user,
            });
        }
        catch (error) {
            if (error instanceof ValidationError) {
                res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: error.message });
                return;
            }

            console.error("Login error:", error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
        }
    };

    /*
     * Handle POST /auth/logout
     * Invalidates session and clears cookie
     */
    logout = async (req: Request, res: Response): Promise<void> => {
        try {
            const sessionId = req.cookies.sessionId;

            if (sessionId) {
                await this.authenticationService.logout(sessionId);
            }

            res.clearCookie("sessionId");

            res.status(HTTP_STATUS.OK).json({
                message: "Logout successful",
            });
        }
        catch (error) {
            console.error("Logout error:", error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
        }
    };

    /** 
     * Handle GET /auth/profile
     * Returns the authenticated user's profile
     */
    getProfile = (req: Request, res: Response): void => {
        res.status(HTTP_STATUS.OK).json({
            user: req.user,
        });
    };
}
