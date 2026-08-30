import type { Request, Response, NextFunction } from "express";
import { createComment, fetchComments, removeComment } from "../services/comments.js";
import { HttpError } from "../errors/HttpError.js";

export const postComment = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) throw new HttpError(401, "Authentication required");

        await createComment(req.user.id, req.params.id, req.body.content.trim());

        res.status(201).json({ message: "Comment posted successfully" });
    } catch (error) {
        next(error);
    }
};

export const getComment = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const comments = await fetchComments(req.params.id);

        res.status(200).json(comments);
    } catch (error) {
        next(error);
    }
};

export const deleteComment = async (
    req: Request<{ postId: string, commentId: string }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) throw new HttpError(401, "Authentication required");
        await removeComment(req.user.id, req.params.postId, req.params.commentId);

        res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
        next(error);
    }
};
