import chalk from "chalk";
import type { Request, Response, NextFunction } from "express";

const methodColor: Record<string, (text: string) => string> = {
    GET: chalk.green,
    POST: chalk.blue,
    PATCH: chalk.magenta,
    PUT: chalk.yellow,
    DELETE: chalk.red
};

const statusMeaning: Record<number, string> = {
    200: "OK",
    201: "Created",
    202: "Accepted",
    204: "No Content",
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    409: "Conflict",
    413: "Payload Too Large",
    415: "Unsupported Media Type",
    422: "Unprocessable Content",
    429: "Too Many Requests",
    500: "Internal Server Error"
};

export const logger = (
    req: Request, 
    res: Response, 
    next: NextFunction
): void => {
    const color = methodColor[req.method] ?? chalk.white;
    const start: number = Date.now();

    res.on("finish", () => {
        const duration: number = Date.now() - start;
        const status: number = res.statusCode;
        const meaning: string = statusMeaning[status] ?? "Unknown";

        console.log(
            color(`${req.method} ${req.originalUrl} ${status} ${meaning} ${duration}ms`)
        );
    })

    next();
};
