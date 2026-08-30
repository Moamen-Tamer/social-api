import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../errors/HttpError.js";
import { getSupabaseUser } from "../repositories/auth.js";
import { validationResult } from "express-validator";

export const validationHandler = (
    req: Request,
    _res: Response,
    next: NextFunction
): void => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        next(new HttpError(400, errors.array()[0]?.msg ?? "Invalid request."));
        return;
    }

    next();
};

export const authenticateToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.cookies.accessToken;

        if (!token) throw new HttpError(401, "access denied, please log in first");

        const { user, error } = await getSupabaseUser(token);

        if (error || !user) throw new HttpError(401, "invalid token");

        const payload = {
            id: user.id,
            username: (user.user_metadata?.username as string | undefined) ?? "",
            email: user.email ?? ""
        };

        req.user = payload

        next();
    } catch (error) {
        next(error);
    }
};