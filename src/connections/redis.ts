import { Redis } from 'ioredis';
import chalk from 'chalk';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export const redis: Redis = new Redis(env.redisUrl, {
    retryStrategy: (times: number) => Math.min(times * 500, 2000),
    enableReadyCheck: true,
    lazyConnect: false
});

redis.on("connect", () => {
    logger.info("Redis connected");
});

redis.on("error", (error: Error) => {
    logger.error({ err: error }, "Redis error");
});