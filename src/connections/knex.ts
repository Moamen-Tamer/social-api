import knex from "knex";
import { env } from "../config/env.js";

export const db = knex({
    client: "pg",

    connection: {
        host: env.dbHost,
        port: env.dbPort,
        user: env.dbUser,
        password: env.dbPassword,
        database: env.dbDatabase
    },

    pool: {
        min: 1,
        max: 10
    }
});