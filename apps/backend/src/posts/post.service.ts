import type { PostRepository, Post, PostWithAuthor } from "./post.repository.js";

export interface CreatePostData {
    userId: string;
    title: string;
    content: string;
}

export interface UpdatePostData {
    title?: string | undefined;
    content?: string | undefined;
}

export class PostService {
    constructor(private postRepository: PostRepository) {}

    async getOwnerId(postId: string): Promise<string | null> {
        const post = await this.postRepository.findById(postId);
        return post?.user_id ?? null;
    }

    async createPost(data: CreatePostData): Promise<Post> {
        return await this.postRepository.create({
            user_id: data.userId,
            title: data.title,
            content: data.content,
        });
    }

    async getAllPosts(): Promise<PostWithAuthor[]> {
        return await this.postRepository.findAll();
    }

    async getPostById(postId: string): Promise<PostWithAuthor | null> {
        return await this.postRepository.findByIdWithAuthor(postId);
    }

    async updatePost(postId: string, data: UpdatePostData): Promise<Post | null> {
        return await this.postRepository.update(postId, {
            title: data.title,
            content: data.content,
        });
    }

    async deletePost(postId: string): Promise<boolean> {
        return await this.postRepository.deleteById(postId);
    }
}
