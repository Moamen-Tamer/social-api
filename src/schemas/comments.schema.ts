import z from "zod";
import { mongoId } from "./common.js";

const postId = z.object({
    id: mongoId("post")
});

const postIdSchema = z.object({
    body: z.unknown(),
    query: z.unknown(),
    params: postId
});

export const createCommentsSchema = z.object({
    body: z.object({
        content: z
            .string()
            .trim()
            .min(1, "Content is required")
            .max(500, "Content must be 500 characters or fewer.")
    }),
    query: z.unknown(),
    params: postId
});

export const deleteCommentsSchema = z.object({
    body: z.unknown(),
    query: z.unknown(),
    params: z.object({
        postId: mongoId("post"),
        commentId: mongoId("comment")
    })
});