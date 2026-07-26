import { env } from "./env.js";

export const accessCookieOptions = {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: 'strict' as const,
    maxAge: 1000 * 60 * 15
};

export const refreshCookieOptions = {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: 'strict' as const,
    maxAge: 1000 * 60 * 60 * 24 * 7
};
