import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../errors/HttpError.js";

export const authorize = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        if (!req.user) throw new HttpError(401, "authentication required");
    
        next();
    } catch (error) {
        next(error);
    }
};