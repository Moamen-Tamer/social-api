import z from "zod";

export const mongoId = (label: string) => z.string().regex(/^[0-9a-fA-F]{24}$/, `Invalid ${label} ID.`);