import express from "express";
import { body } from "express-validator";
import request from "supertest";
import { HttpError } from "../src/errors/HttpError.js";
import { errorHandler } from "../src/middleware/error.js";
import { notFound } from "../src/middleware/notFound.js";
import { validationHandler } from "../src/middleware/authentication.js";
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from "../src/utils/jwt.js";

describe("JWT utilities", () => {
    const payload = { id: "user-id", username: "ahmed_mohamed", email: "ahmedmohamed@gmail.com" };

    it("generates and verifies access and refresh tokens", () => {
        expect(verifyAccessToken(generateAccessToken(payload))).toMatchObject(payload);
        expect(verifyRefreshToken(generateRefreshToken(payload))).toMatchObject(payload);
    });

    it("rejects a token signed with the other secret", () => {
        expect(() => verifyAccessToken(generateRefreshToken(payload))).toThrow();
    });

    it("can issue a new access token from a verified refresh-token payload", () => {
        const refreshedPayload = verifyRefreshToken(generateRefreshToken(payload));
        expect(verifyAccessToken(generateAccessToken(refreshedPayload))).toMatchObject(payload);
    });
});

describe("HTTP middleware", () => {
    const makeApp = () => {
        const app = express();
        app.use(express.json());
        app.post("/validated", body("email").isEmail(), validationHandler, (_req, res) => res.status(204).send());
        app.get("/known", () => { throw new HttpError(409, "Already exists"); });
        app.use(notFound);
        app.use(errorHandler);
        return app;
    };

    it("returns validation errors, typed errors, JSON errors, and 404s correctly", async () => {
        const app = makeApp();
        await request(app).post("/validated").expect(400);
        await request(app).get("/known").expect(409, { message: "Already exists" });
        await request(app).post("/validated").set("Content-Type", "application/json").send("{").expect(400, { message: "Invalid JSON request body." });
        await request(app).get("/missing").expect(404);
    });
});
