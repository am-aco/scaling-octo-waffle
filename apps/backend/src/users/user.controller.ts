import type { Request, Response } from "express";
import { HTTP_STATUS } from "../infrastructure/http.js";
import { UserRepository } from "../auth/user.repository.js";

export class UserController {
    constructor(private userRepository: UserRepository) { }

    getUserById = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.params.userId;

            if (!userId) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: "User ID is required",
                });
                return;
            }

            const user = await this.userRepository.findByIdWithRole(userId);

            if (!user) {
                res.status(HTTP_STATUS.NOT_FOUND).json({
                    error: "User not found",
                });
                return;
            }

            res.status(HTTP_STATUS.OK).json({
                user,
            });
        }
        catch (error) {
            console.error("Get user by ID error:", error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
        }
    };

    getAllUsers = async (_req: Request, res: Response): Promise<void> => {
        try {
            const users = await this.userRepository.findAllWithRoles();

            res.status(HTTP_STATUS.OK).json({
                users,
            });
        }
        catch (error) {
            console.error("Get all users error:", error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
        }
    };
}
