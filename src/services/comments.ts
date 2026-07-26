import { HttpError } from "../errors/HttpError.js";
import { cacheComments, invalidateCommentsCache } from "../repositories/cache.js";
import { addCommentOnPost, deleteCommentOnPost, getCommentsOnPost, getCommentsRedis } from "../repositories/comments.js";
import { postExists } from "../repositories/posts.js";

export const createComment = async (
    userId: string,
    postId: string,
    content: string
): Promise<void> => {
    const post = await postExists(postId);

    if (!post) throw new HttpError(404, "Post not found");

    await addCommentOnPost(userId, postId, content);

    try {
        await invalidateCommentsCache(postId);
    } catch (error) {
        console.error(error);
    }
};

export const fetchComments = async (postId: string) => {
    const cached = await getCommentsRedis(postId);

    if (cached) return cached;

    const post = await postExists(postId);

    if (!post) throw new HttpError(404, "Post not found");

    const comments = await getCommentsOnPost(postId);

    try {
        await cacheComments(postId, comments);
    } catch (error) {
        console.error(error);
    }

    return comments;
};

export const removeComment = async (userId: string, postId: string, commentId: string): Promise<void> => {
    const comment = await deleteCommentOnPost(userId, postId, commentId);

    if (!comment) throw new HttpError(404, "Comment not found or unauthorized to delete");

    try {
        await invalidateCommentsCache(postId);
    } catch (error) {
        console.error(error);
    }
};
