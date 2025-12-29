import type { Request, Response } from "express";
import { HTTP_STATUS } from "../infrastructure/http.js";
import type { UserService } from "./user.service.js";
import { handleControllerError } from "../infrastructure/error-handler.util.js";

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
            handleControllerError(error, req, res, "Get user by ID error");
        }
    };

    getAllUsers = async (req: Request, res: Response): Promise<void> => {
        try {
            const users = await this.userService.getAllUsers();

            res.status(HTTP_STATUS.OK).json({
                users,
            });
        }
        catch (error) {
            handleControllerError(error, req, res, "Get all users error");
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
            handleControllerError(error, req, res, "Create user error");
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
            handleControllerError(error, req, res, "Update user error");
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
            handleControllerError(error, req, res, "Delete user error");
        }
    };
}
