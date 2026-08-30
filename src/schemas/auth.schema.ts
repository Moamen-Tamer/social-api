import z from "zod";

const email = z
    .string()
    .trim()
    .min(1, "email is required")
    .max(255, "email must be 255 characters or less")
    .email("invalid email address")
    .toLowerCase();

const username = z
    .string()
    .trim()
    .min(3, "username must be 3-50 characters")
    .max(50, "username must be 3-50 characters");

const password = z
    .string()
    .trim()
    .min(5, "password must be 5-255 characters")
    .max(255, "password must be 5-255 characters");

export const registerSchema = z.object({
    body: z.object({
        username,
        email,
        password
    }),
    query: z.unknown(),
    params: z.unknown()
});

export const loginSchema = z.object({
    body: z.object({
        email,
        password
    }),
    query: z.unknown(),
    params: z.unknown()
});