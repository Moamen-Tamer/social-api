import express, { type Router } from "express";
import { login, logout, refresh, register } from "../controllers/auth.js";
import { authenticateToken } from "../middleware/authentication.js";
import { authLimiter } from "../middleware/limiter.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";

const auth: Router = express.Router();

auth.post('/register', authLimiter, validate(registerSchema), register);
auth.post('/login', authLimiter, validate(loginSchema), login);
auth.post('/logout', authenticateToken, logout);
auth.post('/refresh', refresh);

export default auth;