import type { Request, Response } from "express";
import { TokenService } from "./token.service.js";
import { HTTP_STATUS } from "../infrastructure/http.js";
import { handleControllerError } from "../infrastructure/error-handler.util.js";

export class TokenController {
    constructor(private tokenService: TokenService) {}

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
            handleControllerError(error, res, "Token login error");
        }
    };

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
            handleControllerError(error, res, "Token refresh error");
        }
    };

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
            handleControllerError(error, res, "Token logout error");
        }
    };
}
