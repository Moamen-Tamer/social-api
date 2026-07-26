import { HttpError } from "../errors/HttpError.js";
import { createUser, existsByEmail, existsByUsername, getUser } from "../repositories/auth.js";
import bcrypt from 'bcrypt';
import type { LoginResult, Payload, User } from "../types/blueprints.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { deleteRefreshToken, isRefreshTokenValid, storeRefreshToken } from "./refreshToken.js";

export const register = async (username: string, email: string, password: string): Promise<void> => {
    const emailExists: boolean = await existsByEmail(email);

    if (emailExists) throw new HttpError(409, "Email is already registered.");

    const usernameExists: boolean = await existsByUsername(username);

    if (usernameExists) throw new HttpError(409, "Username is already taken.");

    const password_hash: string = await bcrypt.hash(password, 12);

    await createUser(username, email, password_hash);
};

export const login = async (email: string, password: string): Promise<LoginResult> => {
    const user: User | null = await getUser(email);

    if (!user) throw new HttpError(401, "Invalid email or password.");

    const passwordMatches: boolean = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) throw new HttpError(401, "Invalid email or password.");

    const accessToken: string = generateAccessToken({ 
        id: user.id,
        username: user.username,
        email: user.email
    });

    const refreshToken: string = generateRefreshToken({ 
        id: user.id,
        username: user.username,
        email: user.email
    });

    await storeRefreshToken(user.id, refreshToken);

    return { 
        user, 
        accessToken, 
        refreshToken 
    };
};

export const logout = async (userId: string, refreshToken: string): Promise<void> => {
    if (!refreshToken) return;

    await deleteRefreshToken(userId, refreshToken);
};

export const validateToken = async (refreshToken: string): Promise<Payload> => {
    if (!refreshToken) throw new HttpError(401, "Refresh token required.");

    const payload: Payload = verifyRefreshToken(refreshToken);

    const isValid: boolean = await isRefreshTokenValid(payload.id, refreshToken);

    if (!isValid) throw new HttpError(401, "Invalid refresh token.");

    return payload;
};