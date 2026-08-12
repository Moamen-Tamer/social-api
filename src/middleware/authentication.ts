import type { Request, Response, NextFunction } from "express";
import { body, Result, validationResult, type ValidationChain, type ValidationError } from "express-validator";
import { HttpError } from "../errors/HttpError.js";
import type { Payload } from "../types/blueprints.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const authenticateToken = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        const token = req.cookies.accessToken;

        if (!token) throw new HttpError(401, "access denied, please log in first");

        const payload: Payload = verifyAccessToken(token);

        if (!payload) throw new HttpError(401, "invalid token");

        req.user = payload

        next();
    } catch (error) {
        next(error);
    }
};

const emailValidation: ValidationChain = body('email')
    .trim()
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("invalid email address")
    .isLength({ min: 3, max: 255 })
    .withMessage("email must be 3-255 characters")
    .normalizeEmail();

const passwordValidation: ValidationChain = body('password')
    .trim()
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 5, max: 255 })
    .withMessage("password must be 5-255 characters");

export const validateRegisterData: ValidationChain[] = [
    body('username').trim()
                    .notEmpty()
                    .withMessage("name is required")
                    .isLength({ min: 3, max: 50 })
                    .withMessage("username must be 3-50 characters"),
    emailValidation, passwordValidation
];

export const validateLoginData: ValidationChain[] = [ emailValidation, passwordValidation ];

export const validationHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const errors: Result<ValidationError> = validationResult(req);
    
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    next();
};