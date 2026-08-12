import { pool } from "../connections/postgres.js";
import type { User } from "../types/blueprints.js";

export const existsByEmail = async (email: string): Promise<boolean> => {
    const { rowCount } = await pool.query(
        `SELECT 1
         FROM users
         WHERE email = $1
         LIMIT 1`,
        [email]
    );

    return rowCount !== 0;
};

export const existsByUsername = async (username: string): Promise<boolean> => {
    const { rowCount } = await pool.query(
        `SELECT 1
         FROM users
         WHERE username = $1
         LIMIT 1`,
        [username]
    );

    return rowCount !== 0;
};

export const createUser = async (username: string, email: string, password: string): Promise<void> => {
    await pool.query(
        `INSERT INTO users (username, email, password_hash)
         VALUES ($1, $2, $3)`,
        [username, email, password]
    );
};

export const getUser = async (email: string): Promise<User | null> => {
    const { rows } = await pool.query<User>(
        `SELECT id, username, email, password_hash 
         FROM users
         WHERE email = $1
         LIMIT 1`,
        [email]
    );

    return rows[0] ?? null;
};