import { Router } from "express";
import { PostController } from "./post.controller.js";
import type { PostService } from "./post.service.js";
import { requireAuth } from "../auth/authentication.middleware.js";

type RequireOwnership = (config: import("../auth/ownership.middleware.js").OwnershipConfig) => import("express").RequestHandler;

interface PostRouterDependencies {
    postService: PostService;
    requireOwnership: RequireOwnership;
}

export function createPostRouter(deps: PostRouterDependencies): Router {
    const router = Router();

    const postController = new PostController(deps.postService);
    const { requireOwnership } = deps;

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
