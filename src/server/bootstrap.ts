import chalk from "chalk";
import type { Server } from "node:http";
import { redis } from "../connections/redis.js";
import mongoose from "mongoose";
import { connectMongo } from "../connections/mongo.js";
import { app } from "./app.js";
import { env } from "../config/env.js";
import { db } from "../connections/knex.js";

let server: Server | undefined;

async function closeConnection(): Promise<void> {
    console.log(chalk.yellow("Closing Connection..."));

    try {
        if (server) {
            await new Promise<void> ((resolve, reject) => {
                server!.close((error: Error | undefined) => (error ? reject(error) : resolve()));
            });
        }
    } catch {}

    try { await db.destroy(); } catch {}
    try { await redis.quit(); } catch {}
    try { await mongoose.disconnect(); } catch {}

    console.log(chalk.green("All connections closed."));
};

async function shutdown(signal: string): Promise<void> {
  console.log(chalk.yellow(`${signal} received. Shutting down...`));
  await closeConnection();
  
  process.exit(0);
}

export async function startServer(): Promise<void> {
    try {
        await connectMongo();
        await redis.ping();
        await db.raw("SELECT 1");

        server = app.listen(env.serverPort, () => {
            console.log(chalk.green(`Server running on port ${env.serverPort}`));
        });
    } catch (err) {
        console.error(chalk.red("Startup failed:", err));
        await closeConnection();

        process.exit(1);
    }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));