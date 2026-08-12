import { Redis } from 'ioredis';
import chalk from 'chalk';
import { env } from '../config/env.js';

export const redis: Redis = new Redis(env.redisUrl, {
    retryStrategy: (times: number) => Math.min(times * 500, 2000),
    enableReadyCheck: true,
    lazyConnect: false
});

redis.on("connect", () => {
    console.log(chalk.green("Redis connected"));
});

redis.on("error", (error: Error) => {
    console.error(chalk.red("Redis error:"), error.message);
});