import { redis } from "../connections/redis.js";
import Post, { type IPost } from "../models/post.model.js";
import type { CreatePostInput } from "../types/blueprints.js";
import { makePostKey } from "../utils/redis.js";
import { HttpError } from "../errors/HttpError.js";
import type mongoose from "mongoose";

export const createPostMongo = (
    authorId: string,
    data: CreatePostInput
) => {
    return Post.create({
        authorId,
        content: data.content,
        ...(data.mediaUrls && { mediaUrls: data.mediaUrls }),
        ...(data.tags && { tags: data.tags })
    });
};

export const getPostMongo = (postId: string) => {
    return Post.findById(postId);
};

export const fetchPostRedis = async (postId: string) => {
    const key = makePostKey(postId);

    const post = await redis.get(key);

    if (!post) return null;

    return JSON.parse(post);
};

export const editPostMongo = async (
    userId: string,
    postId: string, 
    content: string
): Promise<IPost> => {
    const post = await Post.findOneAndUpdate(
        {
            _id: postId,
            authorId: userId
        },
        {
            $set: { content }
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!post) throw new HttpError(404, "Post not found or unauthorized to edit.");

    return post;
};

export const deletePostMongo = async (
    userId: string,
    postId: string,
    session?: mongoose.mongo.ClientSession
): Promise<void> => {
    const deletedPost = await Post.findOneAndDelete(
        {
            _id: postId,
            authorId: userId
        },
        session ? { session } : {}
    );

    if (!deletedPost) throw new HttpError(404, "Post not found or unauthorized to delete.");
};

export const getPostAuthor = async (postId: string): Promise<string> => {
    const post = await Post.findOne(
        { _id: postId },
        { _id: 0, authorId: 1 }
    );

    if (!post) throw new HttpError(404, "Post not found");

    return post.authorId;
};

export const getPostByAuthor = async (authorId: string) => {
    return await Post.find({ authorId }).lean();
};

export const postExists = async (postId: string) => {
    const post = await Post.exists({ _id: postId });

    return post !== null;
};
