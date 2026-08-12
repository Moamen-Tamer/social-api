import { cacheFeed } from "../repositories/cache.js";
import { getCommentsOnPost } from "../repositories/comments.js";
import { getFeedRedis } from "../repositories/feed.js";
import { getFollowings } from "../repositories/follow.js";
import { getLikes } from "../repositories/likes.js";
import { getPostByAuthor } from "../repositories/posts.js";

export const fillFeed = async (userId: string) => {
    const feedRedis = await getFeedRedis(userId);

    if (feedRedis) return feedRedis;

    const followings = await getFollowings(userId);

    if (followings.length === 0) return [];

    const postsArrays = await Promise.all(
        followings.map((following: { id: string }) => getPostByAuthor(following.id))
    );

    const posts = postsArrays.flat();

    posts.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const feed = await Promise.all(
        posts.map(async (post) => {
            const [likes, comments] = await Promise.all([
                getLikes(post._id.toString()),
                getCommentsOnPost(post._id.toString())
            ]);

            return {
                ...post,
                likes,
                comments
            };
        })
    );

    try {
        await cacheFeed(userId, feed);
    } catch (error) {
        console.error(error);
    }

    return feed;
};
