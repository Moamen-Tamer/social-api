import type mongoose from "mongoose";
import Comment from "../models/comment.model.js";
import { redis } from "../connections/redis.js";
import { makeCommentsKey } from "../utils/redis.js";

export const getCommentsOnPost = async (
    postId: string
) => {
    return await Comment.find({ postId }).lean();
};

export const deleteCommentsOnPost = async (
    postId: string,
    session?: mongoose.mongo.ClientSession
): Promise<void> => {
    await Comment.deleteMany(
        { postId },
        session ? { session } : {}
    );
};

export const addCommentOnPost = async (
    authorId: string,
    postId: string,
    content: string
) => {
    return await Comment.create({
        postId,
        authorId,
        content,
        createdAt: new Date()
    });
};

export const getCommentsRedis = async (
    postId: string
): Promise<unknown[] | null> => {
    const key = makeCommentsKey(postId);

    const value = await redis.get(key);

    return value ? JSON.parse(value) as unknown[] : null;
};

export const deleteCommentOnPost = async (
    authorId: string,
    postId: string,
    commentId: string
) => {
    return await Comment.findOneAndDelete({
        _id: commentId,
        postId,
        authorId
    });
};
