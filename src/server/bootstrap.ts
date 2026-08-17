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

    if (server) {
        try{
            server.closeIdleConnections()

            await new Promise<void> ((resolve, reject) => {
                server!.close((error) => (error? reject(error) : resolve()));
            });
        } catch (error) {
            console.error(chalk.red("Error closing HTTP server:"), error);
        }
    }

    try { 
        await db.destroy(); 
    } catch (error) {
        console.error(chalk.red("Error closing Postgres:"), error);
    }

    try { 
        await redis.quit(); 
    } catch (error) {
        console.error(chalk.red("Error closing Redis:"), error);
    }

    try { 
        await mongoose.disconnect(); 
    } catch (error) {
        console.error(chalk.red("Error closing MongoDB:"), error);
    }

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

        await db.raw("SELECT 1")
        console.log(chalk.green("Postgres connected"));

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