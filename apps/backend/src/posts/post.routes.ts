import { Router } from "express";
import { PostController } from "./post.controller.js";
import { PostRepository } from "./post.repository.js";
import { requireAuth } from "../auth/authentication.middleware.js";
import { requireResourceOwnershipOrPermission } from "../auth/resource-ownership.middleware.js";

export function createPostRouter(): Router {
    const router = Router();

    const postRepository = new PostRepository();
    const postController = new PostController(postRepository);

    router.post("/", requireAuth, postController.createPost);

    router.get("/", postController.getAllPosts);

    router.get("/:postId", postController.getPostById);

    router.put(
        "/:postId",
        requireResourceOwnershipOrPermission({
            getResourceOwnerId: async (req) => {
                const post = await postRepository.findById(req.params.postId!);
                return post?.user_id ?? null;
            },
            bypassPermission: "posts:moderate",
        }),
        postController.updatePost
    );

    router.delete(
        "/:postId",
        requireResourceOwnershipOrPermission({
            getResourceOwnerId: async (req) => {
                const post = await postRepository.findById(req.params.postId!);
                return post?.user_id ?? null;
            },
            bypassPermission: "posts:moderate",
        }),
        postController.deletePost
    );

    return router;
}
