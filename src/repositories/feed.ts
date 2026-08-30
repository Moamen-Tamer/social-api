import { redis } from "../connections/redis.js";
import { makeFeedKey } from "../utils/redis.js";

export const getFeedRedis = async (
    userId: string
) => {
    const key = makeFeedKey(userId);

    const value = await redis.get(key);
    
    return value ? JSON.parse(value) as unknown[] : null;
};