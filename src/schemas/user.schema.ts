import z from "zod";

const userId = z.object({
    id: z.uuid("Invalid user ID.")
});

export const userIdSchema = z.object({
    body: z.unknown(),
    query: z.unknown(),
    params: userId
});

export const updateBioSchema = z.object({
    body: z.object({
        update: z
            .string()
            .trim()
            .max(500, "Bio must be a string up to 500 characters.")
    }),
    query: z.unknown(),
    params: userId,
});