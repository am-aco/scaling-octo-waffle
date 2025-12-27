import { Router } from "express";
import { PostController } from "./post.controller.js";
import type { PostRepository } from "./post.repository.js";
import { PostService } from "./post.service.js";
import { requireAuth } from "../auth/authentication.middleware.js";
import { requireOwnership } from "../auth/ownership.middleware.js";

interface PostRouterDependencies {
    postRepository: PostRepository;
}

export function createPostRouter(deps: PostRouterDependencies): Router {
    const router = Router();

    const { postRepository } = deps;
    const postService = new PostService(postRepository);
    const postController = new PostController(postRepository);

    router.post("/", requireAuth, postController.createPost);

    router.get("/", postController.getAllPosts);

    router.get("/:postId", postController.getPostById);

    router.put(
        "/:postId",
        requireOwnership({
            ownerId: async (req) => postService.getOwnerId(req.params.postId!),
            bypassPermission: "posts:moderate",
        }),
        postController.updatePost
    );

    router.delete(
        "/:postId",
        requireOwnership({
            ownerId: async (req) => postService.getOwnerId(req.params.postId!),
            bypassPermission: "posts:moderate",
        }),
        postController.deletePost
    );

    return router;
}
