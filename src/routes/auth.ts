import express, { type Router } from "express";
import { login, logout, refresh, register } from "../controllers/auth.js";
import { authenticateToken, validateLoginData, validateRegisterData, validationHandler } from "../middleware/authentication.js";
import { authLimiter } from "../middleware/limiter.js";

const auth: Router = express.Router();

auth.post('/register', authLimiter, validateRegisterData, validationHandler, register);
auth.post('/login', authLimiter, validateLoginData, validationHandler, login);
auth.post('/logout', authenticateToken, logout);
auth.post('/refresh', refresh);

export default auth;