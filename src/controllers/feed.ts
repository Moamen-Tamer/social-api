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
        
        const feed = await fillFeed(req.user.id);

        res.status(200).json(feed);
    } catch (error) {
        next(error);
    }
};