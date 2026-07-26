import { cacheNotifications, invalidateNotificationsCache } from "../repositories/cache.js";
import { fetchNotifications, getNotificationsRedis, markNotificationsAsRead } from "../repositories/notifications.js";

export const getNotificationsByUserId = async (userId: string) => {
    const notificationsRedis = await getNotificationsRedis(userId);

    if (notificationsRedis) return notificationsRedis;

    const notifications = await fetchNotifications(userId);

    try {
        await cacheNotifications(userId, notifications);
    } catch (error) {
        console.error("Failed to cache notifications:", error);
    }

    return notifications;
};

export const markNotificationsAsReadByUserId = async (userId: string) => {
    await markNotificationsAsRead(userId);

    try {
        await invalidateNotificationsCache(userId);
    } catch (error) {
        console.error(error);
    }
};