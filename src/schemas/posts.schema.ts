import z from "zod";
import { mongoId } from "./common.js";

const postId = z.object({
    id: mongoId("post")
});

export const postIdSchema = z.object({
    body: z.unknown(),
    query: z.unknown(),
    params: postId
});

export const createPostSchema = z.object({
    body: z.object({
        content: z
            .string()
            .trim()
            .min(1, "Content is required.")
            .max(1000, "Content must be 1000 characters or fewer."),
        mediaUrls: z
            .array(z.url("Each media URL must be a valid URL."))
            .max(10, "A post can include at most 10 media URLs.")
            .optional(),
        tags: z
            .array(z
                .string()
                .trim()
                .max(30, "Tags must be 30 characters or fewer.")
            )
            .max(10, "A post can include at most 10 tags.")
            .optional()
    }),
    query: z.unknown(),
    params: z.unknown()
});

export const editPostSchema = z.object({
    body: z.object({
        content: z
            .string()
            .trim()
            .min(1, "Content is required.")
            .max(1000, "Content must be 1000 characters or fewer."),
    }),
    query: z.unknown(),
    params: postId
});