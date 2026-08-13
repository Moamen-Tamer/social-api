import { db } from "../connections/knex.js";
import { pool } from "../connections/postgres.js";
import { HttpError } from "../errors/HttpError.js";

export const removeAllLikes = async (postId: string): Promise<void> => {
    await db("likes")
        .where("post_id", postId)
        .del();
};

export const getLikes = async (postId: string): Promise<number> => {
    const result = await db("likes")
        .where("post_id", postId)
        .count("id as likes_count")
        .first();

    return Number(result?.likes_count ?? 0);
};

export const addLike = async (userId: string, postId: string): Promise<number> => {
    await db("likes").insert({
        user_id: userId,
        post_id: postId
    });

    return await getLikes(postId);
};

export const removeLike = async (userId: string, postId: string): Promise<number> => {
    const deleted = await db("likes")
        .where({
            user_id: userId,
            post_id: postId
        })
        .del();

    if (deleted === 0) throw new HttpError(404, "Post was not liked");

    return await getLikes(postId);
};