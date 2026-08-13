import { db } from "../connections/knex.js";
import { redis } from "../connections/redis.js";
import { makeNotificationsKey } from "../utils/redis.js";
import { invalidateNotificationsCache } from "./cache.js";

export const publishNotification = async (userId: string, type: string, payload: object): Promise<void> => {
    await db("notifications").insert({
        user_id: userId,
        type,
        payload
    });

    await invalidateNotificationsCache(userId);
};

export const markNotificationsAsRead = async (userId: string): Promise<void> => {
    await db("notifications")
        .where("user_id", userId)
        .update({ is_read: true });
};

export const fetchNotifications = async (userId: string): Promise<any[]> => {
    return db("notifications")
        .select(
            "type",
            "payload",
            "is_read",
            "created_at"
        )
        .where("user_id", userId)
        .orderBy("created_at", "desc");
};

export const getNotificationsRedis = async (userId: string) => {
    const key = makeNotificationsKey(userId);

    const result = await redis.get(key);

    return result ? JSON.parse(result) : null;
};
