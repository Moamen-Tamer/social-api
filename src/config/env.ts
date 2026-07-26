import "dotenv/config";

const requireEnv = (key: string): string => {
    const value: string | undefined = process.env[key];

    if (!value) throw new Error(`Missing required environment variable: ${key}`);

    return value;
};

const requireNumberEnv = (key: string): number => {
    const rawValue = requireEnv(key);
    const value: number = Number(rawValue);
    
    if (!Number.isFinite(value) || value <= 0) throw new Error(`${key} must be a positive number`);

    return value;
};

export const env = {
    nodeEnv: requireEnv("NODE_ENV"),
    serverPort: requireNumberEnv("SERVER_PORT"),

    dbHost: requireEnv("DB_HOST"),
    dbPort: requireNumberEnv("DB_PORT"),
    dbUser: requireEnv("DB_USER"),
    dbPassword: requireEnv("DB_PASSWORD"),
    dbDatabase: requireEnv("DB_DATABASE"),

    mongoUri: requireEnv("MONGO_URI"),

    redisUrl: requireEnv("REDIS_URL"),

    accessKeySecret: requireEnv("ACCESS_KEY_SECRET"),
    refreshKeySecret: requireEnv("REFRESH_KEY_SECRET"),

    accessKeyExpiry: requireEnv("ACCESS_KEY_EXPIRY"),
    refreshKeyExpiry: requireEnv("REFRESH_KEY_EXPIRY"),

    refreshTokenTtlSeconds: requireNumberEnv("REFRESH_TOKEN_TTL_SECONDS")
};
