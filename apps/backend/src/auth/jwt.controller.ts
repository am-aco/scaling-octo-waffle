import type { Request, Response } from "express";
import { JwtService } from "./jwt.service.js";
import { HTTP_STATUS } from "../infrastructure/http.js";
import { handleControllerError } from "../infrastructure/error-handler.util.js";

export class JwtController {
    constructor(private jwtService: JwtService) {}

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
            handleControllerError(error, req, res, "JWT login error");
        }
    };
}
