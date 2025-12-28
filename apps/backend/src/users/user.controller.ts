import type { Request, Response } from "express";
import { HTTP_STATUS } from "../infrastructure/http.js";
import type { UserService } from "./user.service.js";
import { ValidationError, ConflictError } from "../infrastructure/errors.js";

export class UserController {
    constructor(private userService: UserService) {}

    getUserById = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.params.userId;

            if (!userId) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: "User ID is required",
                });
                return;
            }

            const user = await this.userService.getUserById(userId);

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
            const users = await this.userService.getAllUsers();

            res.status(HTTP_STATUS.OK).json({
                users,
            });
        }
        catch (error) {
            console.error("Get all users error:", error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
        }
    };

    createUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password, role_id } = req.body;

            if (!email || !password || !role_id) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: "Email, password, and role_id are required",
                });
                return;
            }

            const user = await this.userService.createUser({
                email,
                password,
                role_id,
            });

            res.status(HTTP_STATUS.CREATED).json({
                message: "User created successfully",
                user: {
                    id: user.id,
                    email: user.email,
                    role_id: user.role_id,
                    created_at: user.created_at,
                },
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

            console.error("Create user error:", error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
        }
    };

    updateUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.params.userId;
            const { email, is_active, role_id } = req.body;

            if (!userId) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: "User ID is required",
                });
                return;
            }

            if (!email && is_active === undefined && !role_id) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: "At least one field must be provided for update",
                });
                return;
            }

            const updatedUser = await this.userService.updateUser(userId, {
                email,
                is_active,
                role_id,
            });

            if (!updatedUser) {
                res.status(HTTP_STATUS.NOT_FOUND).json({
                    error: "User not found",
                });
                return;
            }

            res.status(HTTP_STATUS.OK).json({
                message: "User updated successfully",
                user: {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    is_active: updatedUser.is_active,
                    role_id: updatedUser.role_id,
                    updated_at: updatedUser.updated_at,
                },
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

            console.error("Update user error:", error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
        }
    };

    deleteUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.params.userId;

            if (!userId) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: "User ID is required",
                });
                return;
            }

            const deleted = await this.userService.deleteUser(userId);

            if (!deleted) {
                res.status(HTTP_STATUS.NOT_FOUND).json({
                    error: "User not found",
                });
                return;
            }

            res.status(HTTP_STATUS.OK).json({
                message: "User deleted successfully",
            });
        }
        catch (error) {
            console.error("Delete user error:", error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
        }
    };
}
