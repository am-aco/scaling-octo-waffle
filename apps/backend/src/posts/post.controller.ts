import type { Request, Response } from "express";
import { HTTP_STATUS } from "../infrastructure/http.js";
import type { PostService } from "./post.service.js";
import { handleControllerError } from "../infrastructure/error-handler.util.js";

export class PostController {
    constructor(private postService: PostService) {}

    createPost = async (req: Request, res: Response): Promise<void> => {
        try {
            const { title, content } = req.body;

            if (!title || !content) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: "Title and content are required",
                });
                return;
            }

            if (!req.user) {
                res.status(HTTP_STATUS.UNAUTHORIZED).json({
                    error: "Authentication required",
                });
                return;
            }

            const post = await this.postService.createPost({
                userId: req.user.id,
                title,
                content,
            });

            res.status(HTTP_STATUS.CREATED).json({
                message: "Post created successfully",
                post: {
                    id: post.id,
                    title: post.title,
                    content: post.content,
                    created_at: post.created_at,
                },
            });
        }
        catch (error) {
            handleControllerError(error, res, "Create post error");
        }
    };

    getAllPosts = async (_req: Request, res: Response): Promise<void> => {
        try {
            const posts = await this.postService.getAllPosts();

            res.status(HTTP_STATUS.OK).json({
                posts,
            });
        }
        catch (error) {
            handleControllerError(error, res, "Get all posts error");
        }
    };

    getPostById = async (req: Request, res: Response): Promise<void> => {
        try {
            const postId = req.params.postId;

            if (!postId) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: "Post ID is required",
                });
                return;
            }

            const post = await this.postService.getPostById(postId);

            if (!post) {
                res.status(HTTP_STATUS.NOT_FOUND).json({
                    error: "Post not found",
                });
                return;
            }

            res.status(HTTP_STATUS.OK).json({
                post,
            });
        }
        catch (error) {
            handleControllerError(error, res, "Get post by ID error");
        }
    };

    updatePost = async (req: Request, res: Response): Promise<void> => {
        try {
            const postId = req.params.postId;
            const { title, content } = req.body;

            if (!postId) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: "Post ID is required",
                });
                return;
            }

            if (!title && !content) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: "At least one field (title or content) must be provided for update",
                });
                return;
            }

            const updatedPost = await this.postService.updatePost(postId, {
                title,
                content,
            });

            if (!updatedPost) {
                res.status(HTTP_STATUS.NOT_FOUND).json({
                    error: "Post not found",
                });
                return;
            }

            res.status(HTTP_STATUS.OK).json({
                message: "Post updated successfully",
                post: {
                    id: updatedPost.id,
                    title: updatedPost.title,
                    content: updatedPost.content,
                    updated_at: updatedPost.updated_at,
                },
            });
        }
        catch (error) {
            handleControllerError(error, res, "Update post error");
        }
    };

    deletePost = async (req: Request, res: Response): Promise<void> => {
        try {
            const postId = req.params.postId;

            if (!postId) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: "Post ID is required",
                });
                return;
            }

            const deleted = await this.postService.deletePost(postId);

            if (!deleted) {
                res.status(HTTP_STATUS.NOT_FOUND).json({
                    error: "Post not found",
                });
                return;
            }

            res.status(HTTP_STATUS.OK).json({
                message: "Post deleted successfully",
            });
        }
        catch (error) {
            handleControllerError(error, res, "Delete post error");
        }
    };
}
