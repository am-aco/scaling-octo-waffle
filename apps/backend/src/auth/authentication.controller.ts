import type { Request, Response } from "express";
import { AuthenticationService } from "./authentication.service.js";
import { HTTP_STATUS } from "../infrastructure/http.js";
import { handleControllerError } from "../infrastructure/error-handler.util.js";
import { COOKIE_OPTIONS, REMEMBER_ME_DURATION_MS, SESSION_COOKIE_NAME } from "./auth.constants.js";
import { parseSessionToken } from "./token.util.js";

export class AuthenticationController {
    constructor(private authenticationService: AuthenticationService) { }

    /*
     * Handle POST /auth/register
     * Creates a new user account and auto-logs in
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

            res.cookie(SESSION_COOKIE_NAME, result.sessionToken, COOKIE_OPTIONS);

            res.status(HTTP_STATUS.CREATED).json({
                message: "User registered successfully",
                user: result.user,
                csrfToken: result.session.csrf_token,
            });
        }
        catch (error) {
            handleControllerError(error, req, res, "Registration error");
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

            res.cookie(SESSION_COOKIE_NAME, result.sessionToken, cookieOptions);

            res.status(HTTP_STATUS.OK).json({
                message: "Login successful",
                user: result.user,
                csrfToken: result.session.csrf_token,
            });
        }
        catch (error) {
            handleControllerError(error, req, res, "Login error");
        }
    };

    logout = async (req: Request, res: Response): Promise<void> => {
        try {
            const sessionToken = req.cookies[SESSION_COOKIE_NAME];

            if (sessionToken) {
                const parsed = parseSessionToken(sessionToken);
                if (parsed) {
                    await this.authenticationService.logout(parsed.id);
                }
            }

            res.clearCookie(SESSION_COOKIE_NAME);

            res.status(HTTP_STATUS.OK).json({
                message: "Logout successful",
            });
        }
        catch (error) {
            handleControllerError(error, req, res, "Logout error");
        }
    };

    getProfile = async (req: Request, res: Response): Promise<void> => {
        res.status(HTTP_STATUS.OK).json({
            user: req.user,
        });
    };
}
