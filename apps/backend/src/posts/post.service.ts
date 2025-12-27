import type { PostRepository } from "./post.repository.js";

export class PostService {
    constructor(private postRepository: PostRepository) {}

    async getOwnerId(postId: string): Promise<string | null> {
        const post = await this.postRepository.findById(postId);
        return post?.user_id ?? null;
    }
}
