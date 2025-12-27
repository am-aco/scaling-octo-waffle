import type { Request, Response } from "express";
import { TokenService } from "./token.service.js";
import { HTTP_STATUS } from "../infrastructure/http.js";
import { AuthenticationError, ForbiddenError, NotFoundError } from "./auth.errors.js";

export class TokenController {
    constructor(private tokenService: TokenService) {}

    /* Login endpoint - returns access token + refresh token */
    login = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: "Email and password are required",
                });
                return;
            }

            const result = await this.tokenService.login(email, password);

            res.status(HTTP_STATUS.OK).json(result);
        }
        catch (error) {
            if (error instanceof AuthenticationError) {
                res.status(HTTP_STATUS.UNAUTHORIZED).json({
                    error: error.message,
                });
                return;
            }

            if (error instanceof ForbiddenError) {
                res.status(HTTP_STATUS.FORBIDDEN).json({
                    error: error.message,
                });
                return;
            }

            console.error("Token login error:", error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: "Internal server error",
            });
        }
    };

    /* Refresh endpoint - exchange refresh token for new access token */
    refresh = async (req: Request, res: Response): Promise<void> => {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: "Refresh token is required",
                });
                return;
            }

            const result = await this.tokenService.refresh(refreshToken);

            res.status(HTTP_STATUS.OK).json(result);
        }
        catch (error) {
            if (error instanceof AuthenticationError) {
                res.status(HTTP_STATUS.UNAUTHORIZED).json({
                    error: error.message,
                });
                return;
            }

            if (error instanceof NotFoundError) {
                res.status(HTTP_STATUS.NOT_FOUND).json({
                    error: error.message,
                });
                return;
            }

            if (error instanceof ForbiddenError) {
                res.status(HTTP_STATUS.FORBIDDEN).json({
                    error: error.message,
                });
                return;
            }

            console.error("Token refresh error:", error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: "Internal server error",
            });
        }
    };

    /* Logout endpoint - revoke refresh token */
    logout = async (req: Request, res: Response): Promise<void> => {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: "Refresh token is required",
                });
                return;
            }

            await this.tokenService.logout(refreshToken);

            res.status(HTTP_STATUS.OK).json({
                message: "Logged out successfully",
            });
        }
        catch (error) {
            console.error("Token logout error:", error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: "Internal server error",
            });
        }
    };
}
