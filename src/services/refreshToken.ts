import { env } from "../config/env.js";
import { redis } from "../connections/redis.js";

const makeRefreshKey = (userId: string, token: string): string => `refresh:${userId}:${token}`;

export const storeRefreshToken = async (
    userId: string,
    token: string
): Promise<void> => {
    const key: string = makeRefreshKey(userId, token);

    await redis.set(key, "1", "EX", env.refreshTokenTtlSeconds);
};

export const isRefreshTokenValid = async (
    userId: string,
    token: string
): Promise<boolean> => {
    const key: string = makeRefreshKey(userId, token);

    const result: string | null = await redis.get(key);

    return result !== null;
};

export const deleteRefreshToken = async (
    userId: string,
    token: string
): Promise<void> => {
    const key: string = makeRefreshKey(userId,token);

    await redis.del(key);
};

export const deleteAllRefreshTokensForUser = async (userId: string): Promise<void> => {
    const pattern: string = makeRefreshKey(userId, "*");
    let cursor: string = "0";

    do {
        const[nextCursor, keys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
        cursor = nextCursor;

        if (keys.length > 0) await redis.del(...keys);
    } while (cursor !== "0")
};