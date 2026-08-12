import type { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.js";
import { accessCookieOptions, refreshCookieOptions } from "../config/cookies.js";
import { HttpError } from "../errors/HttpError.js";
import { generateAccessToken } from "../utils/jwt.js";
import type { Payload } from "../types/blueprints.js";

export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        await authService.register(req.body.username, req.body.email, req.body.password);

        res.status(201).json({ success: true });
    } catch (error) {
        next(error);
    }
};

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.body.email || !req.body.password) throw new HttpError(400, "All fields (email, password) are required");

        const { user, accessToken, refreshToken } = await authService.login(req.body.email, req.body.password);

        res.cookie("accessToken", accessToken, accessCookieOptions);
        res.cookie("refreshToken", refreshToken, refreshCookieOptions);

        res.status(200).json({
            message: "Login successful.",
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        next(error);
    }
};

export const logout = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (req.user?.id) await authService.logout(req.user.id, refreshToken);

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        res.status(200).json({ message: "Logout successful." });
    } catch (error) {
        next(error);
    }
};

export const refresh = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const refreshToken = req.cookies.refreshToken;

        const user: Payload = await authService.validateToken(refreshToken);

        const accessToken: string = generateAccessToken(user);

        res.cookie("accessToken", accessToken, accessCookieOptions);

        res.status(200).json({ message: "token has been refreshed" });
    } catch (error) {
        next(error);
    }
};
