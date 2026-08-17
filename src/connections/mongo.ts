import mongoose from "mongoose";
import chalk from 'chalk';
import { env } from "../config/env.js";

mongoose.connection.on("disconnected", () => {
    console.warn(chalk.yellow("MongoDB disconnected"));
});

mongoose.connection.on("error", (error: Error) => {
    console.error(chalk.red("MongoDB error:"), error.message);
});

export const connectMongo = async (): Promise<void> => {
    await mongoose.connect(env.mongoUri, {
        autoIndex: false,
        autoCreate: false   
    });

    console.log(chalk.green("MongoDB connected"));
};