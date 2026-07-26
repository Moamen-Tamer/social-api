import { redis } from "../connections/redis.js";
import { makeCommentsKey, makeFeedKey, makeNotificationsKey, makePostKey, makeUserKey } from "../utils/redis.js";

export const cacheUser = async (userId: string, data: object): Promise<void> => {
    await redis.set(makeUserKey(userId), JSON.stringify(data), "EX", 3600);
};

export const invalidateUserCache = async (userId: string): Promise<void> => {
    const key = makeUserKey(userId);

    await redis.del(key);
};

export const cachePost = async (postId: string, data: object): Promise<void> => {
    await redis.set(makePostKey(postId), JSON.stringify(data), 'EX', 3600);
};

export const invalidatePostCache = async (postId: string): Promise<void> => {
    const key = makePostKey(postId);

    await redis.del(key);
};

export const cacheFeed = async (userId: string, data: object): Promise<void> => {
    await redis.set(makeFeedKey(userId), JSON.stringify(data), 'EX', 3600);
};

export const invalidateFeedCache = async (userId: string): Promise<void> => {
    const key = makeFeedKey(userId);

    await redis.del(key);
};

export const cacheComments = async (postId: string, data: object): Promise<void> => {
    await redis.set(makeCommentsKey(postId), JSON.stringify(data), 'EX', 3600);
};

export const invalidateCommentsCache = async (postId: string): Promise<void> => {
    const key = makeCommentsKey(postId);

    await redis.del(key);
};

export const cacheNotifications = async (userId: string, data: object): Promise<void> => {
    await redis.set(makeNotificationsKey(userId), JSON.stringify(data), 'EX', 3600);
};

export const invalidateNotificationsCache = async (userId: string): Promise<void> => {
    const key = makeNotificationsKey(userId);

    await redis.del(key);
};
