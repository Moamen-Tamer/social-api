import { pool } from "../connections/postgres.js";
import { HttpError } from "../errors/HttpError.js";

export const removeAllLikes = async (postId: string): Promise<void> => {
    await pool.query(
        `DELETE FROM likes
         WHERE post_id = $1`,
        [postId]
    );
};

export const getLikes = async (postId: string): Promise<number> => {
    const result = await pool.query(
        `SELECT COUNT(*) AS likes_count
         FROM likes
         WHERE post_id = $1`,
        [postId]
    );

    return Number(result.rows[0].likes_count);
};

export const addLike = async (userId: string, postId: string): Promise<number> => {
    await pool.query(
        `INSERT INTO likes (user_id, post_id)
         VALUES ($1, $2)`,
        [userId, postId]
    );

    return await getLikes(postId);
};

export const removeLike = async (userId: string, postId: string): Promise<number> => {
    const result = await pool.query(
        `DELETE FROM likes
         WHERE user_id = $1
         AND post_id = $2`,
        [userId, postId]
    );

    if (result.rowCount === 0) throw new HttpError(404, "Post was not liked");

    return await getLikes(postId);
};