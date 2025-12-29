import type { Request, Response } from "express";
import { AuthenticationService } from "./authentication.service.js";
import { HTTP_STATUS } from "../infrastructure/http.js";
import { handleControllerError } from "../infrastructure/error-handler.util.js";
import { COOKIE_OPTIONS, REMEMBER_ME_DURATION_MS } from "./auth.constants.js";

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
            handleControllerError(error, res, "Registration error");
        }
    };

    login = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password, rememberMe } = req.body;

            if (!email || !password) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: "Email and password are required",
                });
                return;
            }

            const result = await this.authenticationService.login({
                email,
                password,
                rememberMe: rememberMe === true,
            });

            const cookieOptions = {
                ...COOKIE_OPTIONS,
                maxAge: result.session.is_remember_me ? REMEMBER_ME_DURATION_MS : COOKIE_OPTIONS.maxAge,
            };

            res.cookie("sessionId", result.session.id, cookieOptions);

            res.status(HTTP_STATUS.OK).json({
                message: "Login successful",
                user: result.user,
                csrfToken: result.session.csrf_token,
            });
        }
        catch (error) {
            handleControllerError(error, res, "Login error");
        }
    };

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
            handleControllerError(error, res, "Logout error");
        }
    };

    getProfile = async (req: Request, res: Response): Promise<void> => {
        res.status(HTTP_STATUS.OK).json({
            user: req.user,
        });
    };
}
