import { pool } from "../infrastructure/database.js";

export interface Post {
    id: string;
    user_id: string;
    title: string;
    content: string;
    created_at: Date;
    updated_at: Date;
}

export interface CreatePostData {
    user_id: string;
    title: string;
    content: string;
}

export interface UpdatePostData {
    title?: string;
    content?: string;
}

export interface PostWithAuthor {
    id: string;
    title: string;
    content: string;
    created_at: Date;
    updated_at: Date;
    author: {
        id: string;
        email: string;
    };
}

export class PostRepository {
    async create(postData: CreatePostData): Promise<Post> {
        const result = await pool.query<Post>(
            `INSERT INTO posts (user_id, title, content)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [postData.user_id, postData.title, postData.content]
        );

        return result.rows[0]!;
    }

    async findById(postId: string): Promise<Post | null> {
        const result = await pool.query<Post>(
            "SELECT * FROM posts WHERE id = $1",
            [postId]
        );

        return result.rows[0] ?? null;
    }

    async findByIdWithAuthor(postId: string): Promise<PostWithAuthor | null> {
        const result = await pool.query<PostWithAuthor>(
            `SELECT
                posts.id,
                posts.title,
                posts.content,
                posts.created_at,
                posts.updated_at,
                json_build_object('id', users.id, 'email', users.email) as author
             FROM posts
             INNER JOIN users ON posts.user_id = users.id
             WHERE posts.id = $1`,
            [postId]
        );

        return result.rows[0] ?? null;
    }

    async findAll(): Promise<PostWithAuthor[]> {
        const result = await pool.query<PostWithAuthor>(
            `SELECT
                posts.id,
                posts.title,
                posts.content,
                posts.created_at,
                posts.updated_at,
                json_build_object('id', users.id, 'email', users.email) as author
             FROM posts
             INNER JOIN users ON posts.user_id = users.id
             ORDER BY posts.created_at DESC`
        );

        return result.rows;
    }

    async update(postId: string, updates: UpdatePostData): Promise<Post | null> {
        const fields: string[] = [];
        const values: unknown[] = [];
        let paramCount = 1;

        if (updates.title !== undefined) {
            fields.push(`title = $${paramCount}`);
            values.push(updates.title);
            paramCount++;
        }

        if (updates.content !== undefined) {
            fields.push(`content = $${paramCount}`);
            values.push(updates.content);
            paramCount++;
        }

        if (fields.length === 0) {
            return await this.findById(postId);
        }

        fields.push(`updated_at = NOW()`);
        values.push(postId);

        const result = await pool.query<Post>(
            `UPDATE posts
             SET ${fields.join(", ")}
             WHERE id = $${paramCount}
             RETURNING *`,
            values
        );

        return result.rows[0] ?? null;
    }

    async deleteById(postId: string): Promise<boolean> {
        const result = await pool.query(
            "DELETE FROM posts WHERE id = $1",
            [postId]
        );

        return result.rowCount !== null && result.rowCount > 0;
    }
}
