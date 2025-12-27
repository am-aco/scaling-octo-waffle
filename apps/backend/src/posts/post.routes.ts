import { Router } from "express";
import { PostController } from "./post.controller.js";
import type { PostService } from "./post.service.js";
import { requireAuth } from "../auth/authentication.middleware.js";
import { requireOwnership } from "../auth/ownership.middleware.js";

interface PostRouterDependencies {
    postService: PostService;
}

export function createPostRouter(deps: PostRouterDependencies): Router {
    const router = Router();

    const postController = new PostController(deps.postService);

    router.post("/", requireAuth, postController.createPost);

    router.get("/", postController.getAllPosts);

    router.get("/:postId", postController.getPostById);

    router.put(
        "/:postId",
        requireOwnership({
            ownerId: async (req) => deps.postService.getOwnerId(req.params.postId!),
            bypassPermission: "posts:moderate",
        }),
        postController.updatePost
    );

    router.delete(
        "/:postId",
        requireOwnership({
            ownerId: async (req) => deps.postService.getOwnerId(req.params.postId!),
            bypassPermission: "posts:moderate",
        }),
        postController.deletePost
    );

    return router;
}
