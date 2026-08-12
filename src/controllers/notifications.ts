import type { Request, Response, NextFunction } from "express";
import { getNotificationsByUserId, markNotificationsAsReadByUserId } from "../services/notifications.js";
import { HttpError } from "../errors/HttpError.js";

export const getNotifications = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) throw new HttpError(401, "Authentication required");

        const notifications = await getNotificationsByUserId(req.user.id);

        res.status(200).json(notifications);
    } catch (error) {
        next(error);
    }
};

export const markNotifications = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) throw new HttpError(401, "Authentication required");

        await markNotificationsAsReadByUserId(req.user.id);

        res.status(200).json({ message: "all marked as read successfully" });
    } catch (error) {
        next(error);
    }
};