import { HttpError } from "../errors/HttpError.js";
import { addFollowing, deleteFollowing, deleteUserAccount, deleteUserRelated, fetchUserPsql, fetchUserRedis, getFollowers, updateUserBioPsql } from "../repositories/users.js";
import type { User } from "../types/blueprints.js";
import { pool } from "../connections/postgres.js";
import { publishNotification } from "../repositories/notifications.js";
import type { PoolClient, QueryResult } from "pg";
import { cacheUser, invalidateFeedCache, invalidateUserCache } from "../repositories/cache.js";
import { deleteAllRefreshTokensForUser } from "./refreshToken.js";

export const getUserDataById = async (userId: string) => {
    let user = await fetchUserRedis(userId);

    if (user) return user;
    
    user = await fetchUserPsql(userId);

    if (!user) throw new HttpError(404, "User not found.");

    await cacheUser(userId, user);

    return user;
};

export const updateUserBioById = async (userId: string, update: string): Promise<User> => {
    const result: QueryResult<User> = await updateUserBioPsql(userId, update);

    if (result.rowCount === 0) throw new HttpError(404, "User not found");

    await invalidateUserCache(userId);

    return result.rows[0]!;
};

export const deleteUserById = async (userId: string): Promise<void> => {
    const client: PoolClient = await pool.connect();

    try {
        await client.query("BEGIN");

        await deleteUserRelated(userId);
        await deleteUserAccount(userId, client);
        await client.query("COMMIT");

        await Promise.all([
            invalidateUserCache(userId),
            deleteAllRefreshTokensForUser(userId)
        ]);
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

export const followUserById = async (follower_id: string, following_id: string): Promise<void> => {
    if (follower_id === following_id) throw new HttpError(400, "You cannot follow yourself.");

    const following = await getUserDataById(following_id);

    const result = await addFollowing(follower_id, following_id);

    if (result.rowCount === 0) throw new HttpError(409, "Already following this user.");

    const follower = await getUserDataById(follower_id);

    const payload = {
        followerId: follower.id,
        followerName: follower.username
    };

    await publishNotification(following.id, "follow", payload);

    await Promise.all([
        invalidateUserCache(follower_id),
        invalidateUserCache(following_id),
        invalidateFeedCache(follower_id),
        invalidateFeedCache(following_id)
    ]);
};

export const unfollowUserById = async (follower_id: string, following_id: string): Promise<void> => {
    if (follower_id === following_id) throw new HttpError(400, "You cannot unfollow yourself.");

    const result = await deleteFollowing(follower_id, following_id);

    if (result.rowCount === 0) throw new HttpError(404, "You are not following this user.");

    await Promise.all([
        invalidateUserCache(follower_id),
        invalidateUserCache(following_id),
        invalidateFeedCache(follower_id),
        invalidateFeedCache(following_id)
    ]);
};

export const getFollowersById = async (userId: string) => {
    const result = await getFollowers(userId);

    return result.rows;
};
