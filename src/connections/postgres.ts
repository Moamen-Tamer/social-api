import pg, { Pool } from 'pg';
import { env } from '../config/env.js';
import chalk from 'chalk';

pg.types.setTypeParser(1700, (val: string) => parseFloat(val)); 

export const pool: Pool = new Pool({
    host: env.dbHost,
    port: env.dbPort,
    user: env.dbUser,
    password: env.dbPassword,
    database: env.dbDatabase,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
});

pool.on("connect", () => {
    console.log(chalk.green("Postgres connected"));
})

pool.on("error", (error: Error) => {
    console.error(chalk.red("Postgres error: "), error.message);
});