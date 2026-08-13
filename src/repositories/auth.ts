import { db } from "../connections/knex.js";
import { pool } from "../connections/postgres.js";
import type { User } from "../types/blueprints.js";

export const existsByEmail = async (email: string): Promise<boolean> => {
    const user = await db("user")
        .select("id")
        .where("email", email)
        .first();

    return user !== undefined;
};

export const existsByUsername = async (username: string): Promise<boolean> => {
    const user = await db("user")
        .select("id")
        .where("username", username)
        .first();

    return user !== undefined;
};

export const createUser = async (username: string, email: string, password: string): Promise<void> => {
    await db("users").insert({
        username,
        email,
        password_hash: password
    });
};

export const getUser = async (email: string): Promise<User | null> => {
    const user = await db("users")
        .select(
            "id",
            "username",
            "email",
            "password_hash"
        )
        .where("email", email)
        .first();

    return user ?? null;
};