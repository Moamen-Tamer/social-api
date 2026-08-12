import type { Request, Response, NextFunction } from "express";
import { deleteUserById, followUserById, getFollowersById, getUserDataById, unfollowUserById, updateUserBioById } from "../services/users.js";
import type { User } from "../types/blueprints.js";
import { HttpError } from "../errors/HttpError.js";

export const getUserById = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const user = await getUserDataById(req.params.id);

        res.status(200).json({ user });
    } catch (error) {
        next(error);
    }
};

export const updateBio = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user || req.user.id !== req.params.id) {
            throw new HttpError(403, "You can only update your own bio.");
        }

        if (typeof req.body.update !== "string" || req.body.update.trim().length > 500) {
            throw new HttpError(400, "Bio must be a string up to 500 characters.");
        }

        const user: User = await updateUserBioById(req.params.id, req.body.update.trim());

        res.status(200).json({
            id: user.id,
            username: user.username,
            email: user.email,
            bio: user.bio
        });
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user || req.user.id !== req.params.id) {
            throw new HttpError(403, "You can only delete your own account.");
        }

        await deleteUserById(req.params.id);

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        next(error);
    }
};

export const followUser = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) throw new HttpError(401, "Authentication required");
        await followUserById(req.user.id, req.params.id);

        res.status(200).json({ message: "followed successfully" });
    } catch (error) {
        next(error);
    }
};

export const unfollowUser = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) throw new HttpError(401, "Authentication required");
        await unfollowUserById(req.user.id, req.params.id);

        res.status(200).json({ message: "unfollowed successfully" });
    } catch (error) {
        next(error);
    }
};

export const listFollowers = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const followers = await getFollowersById(req.params.id);

        res.status(200).json({
            followers
        });
    } catch (error) {
        next(error);
    }
};
