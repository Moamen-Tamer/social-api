import { pool } from "../connections/postgres.js";
import { redis } from "../connections/redis.js";
import { makeNotificationsKey } from "../utils/redis.js";
import { invalidateNotificationsCache } from "./cache.js";

export const publishNotification = async (userId: string, type: string, payload: object): Promise<void> => {
    await pool.query(
        `INSERT INTO notifications (user_id, type, payload)
         VALUES ($1, $2, $3)`,
        [userId, type, payload]
    );

    await invalidateNotificationsCache(userId);
};

export const markNotificationsAsRead = async (userId: string): Promise<void> => {
    await pool.query(
        `UPDATE notifications
         SET is_read = true
         WHERE user_id = $1`,
        [userId]
    );
};

export const fetchNotifications = async (userId: string): Promise<any[]> => {
    const result = await pool.query(
        `SELECT type, payload, is_read, created_at
         FROM notifications
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId]
    );

    return result.rows;
};

export const getNotificationsRedis = async (userId: string) => {
    const key = makeNotificationsKey(userId);

    const result = await redis.get(key);

    return result ? JSON.parse(result) : null;
};
