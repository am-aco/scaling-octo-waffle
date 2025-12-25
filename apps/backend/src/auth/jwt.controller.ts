import type { Request, Response } from "express";
import { JwtService } from "./jwt.service.js";
import { HTTP_STATUS } from "../infrastructure/http.js";

export class JwtController {
    constructor(private jwtService: JwtService) {}

    /* JWT login endpoint */
    login = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: "Email and password are required",
                });
                return;
            }

            const result = await this.jwtService.login(email, password);

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

            console.error("JWT login error:", error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: "An error occurred during login",
            });
        }
    };
}
