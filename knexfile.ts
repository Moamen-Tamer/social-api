/// <reference types="node" />

import type { Knex } from "knex";
import "dotenv/config";

const requireEnv = (key: string): string => {
    const value = process.env[key];

    if (!value) throw new Error(`Missing required environment variable: ${key}`);

    return value;
};

const requirePort = (key: string): number => {
    const value = Number(requireEnv(key));

    if (!Number.isInteger(value) || value <= 0 || value > 65535) {
        throw new Error(`${key} must be a valid port number`);
    }

    return value;
};

const knexConfig: Record<string, Knex.Config> = {
    development: {
        client: "pg",

        connection: {
            host: requireEnv("DB_HOST"),
            port: requirePort("DB_PORT"),
            user: requireEnv("DB_USER"),
            password: requireEnv("DB_PASSWORD"),
            database: requireEnv("DB_DATABASE")
        },

        migrations: {
            directory: "./migrations",
            extension: "ts",
            loadExtensions: [".ts"],
        }
    }
};

export { knexConfig };
export default knexConfig;