import type { Request, Response, NextFunction } from "express";
import { createPostById, deletePostById, editPostById, getPostById, likePostById, unlikePostById } from "../services/posts.js";
import { HttpError } from "../errors/HttpError.js";

export const createPost = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) throw new HttpError(401, "Authentication required");
        if (typeof req.body.content !== "string" || !req.body.content.trim()) throw new HttpError(400, "Content is required.");
        const post = await createPostById(req.user.id, { ...req.body, content: req.body.content.trim() });

        res.status(201).json(post);
    } catch (error) {
        next(error);
    }
};

export const getPost = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const post = await getPostById(req.params.id)

        res.status(200).json(post);
    } catch (error) {
        next(error);
    }
};

export const editPost = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) throw new HttpError(401, "Authentication required");
        if (typeof req.body.content !== "string" || !req.body.content.trim()) throw new HttpError(400, "Content is required.");

        const post = await editPostById(req.user.id, req.params.id, req.body.content.trim());

        res.status(200).json(post);
    } catch (error) {
        next(error);
    }
};

export const deletePost = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) throw new HttpError(401, "Authentication required");
        await deletePostById(req.user.id, req.params.id);

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const likePost = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) throw new HttpError(401, "Authentication required");
        const likes = await likePostById(req.user.id, req.user.username, req.params.id);

        res.status(200).json({ 
            message: "Post liked successfully",
            likes 
        });
    } catch (error) {
        next(error);
    }
};

export const unlikePost = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) throw new HttpError(401, "Authentication required");
        const likes = await unlikePostById(req.user.id, req.params.id);

        res.status(200).json({ 
            message: "Post unliked successfully",
            likes 
        });
    } catch (error) {
        next(error);
    }
};
