import { pool } from "../connections/postgres.js";

export const getFollowersIds = async (userId: string) => {
    const result = await pool.query(
        `SELECT follower_id
         FROM follows
         WHERE following_id = $1`,
        [userId]
    );

    return result.rows.map((row) => row.follower_id);
};

export const getFollowings = async (userId: string) => {
    const result = await pool.query(
        `SELECT u.id, u.username
         FROM follows f
         JOIN users u
         ON f.following_id = u.id
         WHERE f.follower_id = $1
         ORDER BY u.username ASC`,
        [userId]
    );

    return result.rows;
}