import { redis } from "../connections/redis.js";
import { supabase } from "../connections/supabase.js";
import { HttpError } from "../errors/HttpError.js";
import { makeNotificationsKey } from "../utils/redis.js";
import { invalidateNotificationsCache } from "./cache.js";

export const publishNotification = async (userId: string, type: string, payload: object): Promise<void> => {
    const { error } = await supabase
        .from("notifications")
        .insert({
            user_id: userId,
            type,
            payload
        })

    if (error) throw new HttpError(500, "Failed to publish notification");

    await invalidateNotificationsCache(userId);
};

export const markNotificationsAsRead = async (userId: string): Promise<void> => {
    const { error } = await supabase
        .from("notifications")
        .update({
            is_read: true
        })
        .eq("user_id", userId)

    if (error) throw new HttpError(500, "Failed to mark notifications as read");
};

export const fetchNotifications = async (userId: string): Promise<any[]> => {
    const { data, error } = await supabase
        .from("notifications")
        .select("type, payload, is_read, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) throw new HttpError(500, "Failed to fetch notifications");

    return data ?? [];
};

export const getNotificationsRedis = async (userId: string) => {
    const key = makeNotificationsKey(userId);

    const result = await redis.get(key);

    return result ? JSON.parse(result) : null;
};
