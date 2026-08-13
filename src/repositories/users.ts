import type { PoolClient, QueryResult } from "pg";
import { pool } from "../connections/postgres.js";
import { redis } from "../connections/redis.js";
import type { User } from "../types/blueprints.js";
import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";
import type mongoose from "mongoose";
import { makeUserKey } from "../utils/redis.js";
import { db } from "../connections/knex.js";
import type { Knex } from "knex";

export const fetchUserRedis = async (userId: string) => {
    const key = makeUserKey(userId);

    const user = await redis.get(key);

    if (!user) return null;

    return JSON.parse(user);
};

export const fetchUserPsql = async (userId: string) => {
    return db("users")
        .select(
            "id",
            "username",
            "bio",
            "created_at"
        )
        .where("id", userId)
        .first();
};

export const updateUserBioPsql = async (
    userId: string, 
    update: string
) => {
    const rows = await db("users")
        .where("id", userId)
        .update(
            {
                bio: update
            },
            [
                "id",
                "username",
                "email",
                "bio",
                "created_at"
            ]
        );

    return { rows };
};

export const deleteUserAccount = async (
    userId: string, 
    client: Knex | Knex.Transaction = db
): Promise<void> => {
    await client("users")
        .where("id", userId)
        .del();
};

export const deleteUserRelated = async (
    userId: string, 
    session?: mongoose.mongo.ClientSession
): Promise<void> => {
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

export const addFollowing = async (
    followerId: string, 
    followingId: string
) => {
    return await db("follows")
        .insert({
            follower_id: followerId,
            following_id: followingId
        })
        .onConflict([
            "follower_id",
            "following_id"
        ])
        .ignore()
        .returning([
            "follower_id",
            "following_id",
            "created_at"
        ]);
};

export const deleteFollowing = async (
    followerId: string, 
    followingId: string
) => {
    return db("follows")
        .where({
            follower_id: followerId,
            following_id: followingId
        })
        .del()
        .returning(["*"]);
};

export const getFollowers = async (userId: string) => {
    return db("follows as f")
        .join(
            "users as u",
            "f.follower_id",
            "u.id"
        )
        .select(
            "u.id",
            "u.username",
            "u.bio"
        )
        .where(
            "f.following_id", 
            userId
        )
        .orderBy(
            "f.created_at", 
            "desc"
        );
};
