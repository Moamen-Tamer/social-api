import type { PoolClient, QueryResult } from "pg";
import { pool } from "../connections/postgres.js";
import { redis } from "../connections/redis.js";
import type { User } from "../types/blueprints.js";
import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";
import type mongoose from "mongoose";
import { makeUserKey } from "../utils/redis.js";

export const fetchUserRedis = async (userId: string) => {
    const key = makeUserKey(userId);

    const user = await redis.get(key);

    if (!user) return null;

    return JSON.parse(user);
};

export const fetchUserPsql = async (userId: string) => {
    const { rows } = await pool.query(
        `SELECT id, username, bio, created_at
         FROM users
         WHERE id = $1
         LIMIT 1`,
        [userId]
    );

    return rows[0];
};

export const updateUserBioPsql = async (userId: string, update: string): Promise<QueryResult<User>> => {
    const result = await pool.query(
        `UPDATE users
         SET bio = $1
         WHERE id = $2
         RETURNING *`,
        [update, userId]
    );

    return result;
};

export const deleteUserAccount = async (userId: string, client: PoolClient): Promise<void> => {
    await client.query(
        `DELETE FROM users
         WHERE id = $1`,
        [userId]
    );
};

export const deleteUserRelated = async (userId: string, session?: mongoose.mongo.ClientSession): Promise<void> => {
    await Promise.all([
        Post.deleteMany(
            { authorId: userId },
            session ? { session } : {}
        ),
        Comment.deleteMany(
            { authorId: userId },
            session ? { session } : {}
        )
    ]);
};

export const addFollowing = async (follower_id: string, followingId: string) => {
    const result = await pool.query(
        `INSERT INTO follows (follower_id, following_id)
         VALUES ($1, $2)
         ON CONFLICT (follower_id, following_id) DO NOTHING
         RETURNING *`,
        [follower_id, followingId]
    );

    return result;
};

export const deleteFollowing = async (follower_id: string, followingId: string) => {
    const result = await pool.query(
        `DELETE FROM follows
         WHERE follower_id = $1
         AND following_id = $2
         RETURNING *`,
        [follower_id, followingId]
    );  

    return result;
};

export const getFollowers = async (userId: string) => {
    return await pool.query(
        `SELECT u.id, u.username, u.bio
         FROM follows f
         JOIN users u
         ON f.follower_id = u.id
         WHERE f.following_id = $1
         ORDER BY f.created_at DESC`,
        [userId]
    );
};
