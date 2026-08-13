import { db } from "../connections/knex.js";

export const getFollowersIds = async (userId: string) => {
    return db("follows")
        .where("following_id", userId)
        .pluck("follower_id");
};

export const getFollowings = async (userId: string) => {
    /* const result = await pool.query(
        `SELECT u.id, u.username
         FROM follows f
         JOIN users u
         ON f.following_id = u.id
         WHERE f.follower_id = $1
         ORDER BY u.username ASC`,
        [userId]
    );

    return result.rows; */

    return db("follows as f")
        .join(
            "users as u",
            "f.following_id",
            "u.id"
        )
        .select(
            "u.id",
            "u.username"
        )
        .where("f.follower_id", userId)
        .orderBy("u.username", "asc")
};