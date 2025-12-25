import type { Request, Response } from "express";
import { HTTP_STATUS } from "../infrastructure/http.js";
import { PostRepository } from "./post.repository.js";

export class PostController {
    constructor(private postRepository: PostRepository) { }

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

            const post = await this.postRepository.create({
                user_id: req.user.id,
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
            console.error("Create post error:", error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
        }
    };

    getAllPosts = async (_req: Request, res: Response): Promise<void> => {
        try {
            const posts = await this.postRepository.findAll();

            res.status(HTTP_STATUS.OK).json({
                posts,
            });
        }
        catch (error) {
            console.error("Get all posts error:", error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
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

            const post = await this.postRepository.findByIdWithAuthor(postId);

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
            console.error("Get post by ID error:", error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
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

            const updatedPost = await this.postRepository.update(postId, {
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
            console.error("Update post error:", error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
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

            const deleted = await this.postRepository.deleteById(postId);

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
            console.error("Delete post error:", error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
        }
    };
}
