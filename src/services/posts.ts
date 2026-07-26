import { HttpError } from "../errors/HttpError.js";
import { cachePost, invalidateFeedCache, invalidatePostCache } from "../repositories/cache.js";
import { deleteCommentsOnPost, getCommentsOnPost } from "../repositories/comments.js";
import { getFollowersIds } from "../repositories/follow.js";
import { createPostMongo, deletePostMongo, editPostMongo, fetchPostRedis, getPostAuthor, getPostMongo } from "../repositories/posts.js";
import { fetchUserPsql } from "../repositories/users.js";
import type { CreatePostInput } from "../types/blueprints.js";
import type { IPost } from "../models/post.model.js";
import { addLike, getLikes, removeAllLikes, removeLike } from "../repositories/likes.js";
import { publishNotification } from "../repositories/notifications.js";

export const createPostById = async (
    userId: string,
    data: CreatePostInput
) => {
    const post = await createPostMongo(userId, data);

    const followersIds = await getFollowersIds(userId);

    await Promise.all([
        invalidateFeedCache(userId),
        ...followersIds.map((id) => invalidateFeedCache(id))
    ]);

    return post;
};

export const getPostById = async (postId: string) => {
    const data = await fetchPostRedis(postId);

    if (data) return data;

    const postData = await getPostMongo(postId);

    if (!postData) throw new HttpError(404, "Post not found.");

    const author = await fetchUserPsql(postData.authorId);

    if (!author) throw new HttpError(404, "Post author not found.");

    const comments = await getCommentsOnPost(postId);

    const likes = await getLikes(postId);
    
    const post = {
        id: postData.id,
        author: {
            id: author.id,
            username: author.username
        },
        content: postData.content,
        mediaUrls: postData.mediaUrls,
        tags: postData.tags,
        likesCount: likes,
        comments: comments.map(comment => comment.content)
    };

    try {
        await cachePost(postId, post);
    } catch (error) {
        console.error(error);
    }

    return post;
};

export const editPostById = async (
    userId: string,
    postId: string,
    content: string
): Promise<IPost> => {
    const updatedPost = await editPostMongo(userId, postId, content);
    
    try {
        await Promise.all([
            invalidateFeedCache(userId),
            invalidatePostCache(postId)
        ]);
    } catch (error) {
        console.error("Cache invalidation failed:", error);
    }

    return updatedPost;
};

export const deletePostById = async (
    userId: string,
    postId: string
): Promise<void> => {
    try {
        await deletePostMongo(userId, postId);
        await deleteCommentsOnPost(postId);

        await removeAllLikes(postId);

        try {
            const followersIds = await getFollowersIds(userId);
            await Promise.all([
                invalidatePostCache(postId),
                invalidateFeedCache(userId),
                ...followersIds.map((id) => invalidateFeedCache(id))
            ]);
        } catch (error) {
            console.error("Cache invalidation failed:", error);
        }
    } catch (error) {
        throw error;
    }
};

export const likePostById = async (
    userId: string,
    username: string,
    postId: string
): Promise<number> => {
    const authorId: string = await getPostAuthor(postId);
    let likes: number;

    try {
        likes = await addLike(userId, postId);
    } catch (error: any) {
        if (error.code === "23505") throw new HttpError(409, "Post already liked");

        throw error;
    }

    if (authorId !== userId) {
        try {
            await publishNotification(
                authorId, 
                "like", 
                { 
                    message: `${username} has liked your post`
                }
            );
        } catch (error) {
            console.error("Notification failed:", error);
        }
    }

    try {
        await invalidatePostCache(postId);
    } catch (error) {
        console.error("Cache invalidation failed:", error);
    }

    return likes;
};

export const unlikePostById = async (
    userId: string,
    postId: string
): Promise<number> => {
    await getPostAuthor(postId);
    
    const likes = await removeLike(userId, postId);

    try {
        await invalidatePostCache(postId);
    } catch (error) {
        console.error("Cache invalidation failed:", error);
    }

    return likes;
};
