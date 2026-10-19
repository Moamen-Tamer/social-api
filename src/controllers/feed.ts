import type { Request, Response, NextFunction } from "express";
import { fillFeed } from "../services/feed.js";
import { HttpError } from "../errors/HttpError.js";

export const getPosts = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) throw new HttpError(401, "Authentication required");

        const limitQuery = req.query.limit;
        let limit: number | undefined;

        if (limitQuery !== undefined) {
            if (typeof limitQuery !== "string") throw new HttpError(400, "Limit must be a single number");

            limit = Number(limitQuery);

            if (!Number.isInteger(limit) || limit < 1) throw new HttpError(400, "Limit must be a positive integer");
        }

        const feed = await fillFeed(req.user.id, limit);

        res.status(200).json(feed);
    } catch (error) {
        next(error);
    }
};