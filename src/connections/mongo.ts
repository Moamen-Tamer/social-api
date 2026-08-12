import mongoose from "mongoose";
import chalk from 'chalk';
import { env } from "../config/env.js";

export const connectMongo = async (): Promise<void> => {
    try {
        await mongoose.connect(env.mongoUri);

        console.log(chalk.green("MongoDB connected"));

        mongoose.connection.on("disconnected", () => {
            console.warn(chalk.yellow("MongoDB disconnected"));
        });

        mongoose.connection.on("error", (error: Error) => {
            console.error(chalk.red("MongoDB error:"), error.message);
        })
    } catch (error) {
        console.error(chalk.red("MongoDB connection failed:"), error);

        process.exit(1);
    }
}