import type { Request, Response } from "express";
import { TokenService } from "./token.service.js";
import { HTTP_STATUS } from "../infrastructure/http.js";

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
            if (error instanceof Error && error.message === "Invalid credentials") {
                res.status(HTTP_STATUS.UNAUTHORIZED).json({
                    error: "Invalid credentials",
                });
                return;
            }

            if (error instanceof Error && error.message === "Account is inactive") {
                res.status(HTTP_STATUS.FORBIDDEN).json({
                    error: "Account is inactive",
                });
                return;
            }

            console.error("Token login error:", error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: "An error occurred during login",
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
            if (
                error instanceof Error &&
                (error.message === "Invalid or expired refresh token" ||
                    error.message === "User not found" ||
                    error.message === "Account is inactive")
            ) {
                res.status(HTTP_STATUS.UNAUTHORIZED).json({
                    error: error.message,
                });
                return;
            }

            console.error("Token refresh error:", error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: "An error occurred during token refresh",
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
                error: "An error occurred during logout",
            });
        }
    };
}
