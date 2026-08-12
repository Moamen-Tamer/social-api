import cookieParser from "cookie-parser";
import express, { type Express } from "express";
import helmet from "helmet";
import auth from "../routes/auth.js";
import users from "../routes/users.js";
import posts from "../routes/posts.js";
import feed from "../routes/feed.js";
import comments from "../routes/comments.js";
import notifications from "../routes/notifications.js";
import { authenticateToken } from "../middleware/authentication.js";
import { authorize } from "../middleware/authorization.js";
import { limiter } from "../middleware/limiter.js";
import { logger } from "../middleware/logger.js";
import { notFound } from "../middleware/notFound.js";
import { errorHandler } from "../middleware/error.js";

export const app: Express = express();

// body parser middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// general middlewares
app.use(helmet());
app.use(logger);

// limiter
app.use(limiter);

// routes
app.use('/api/auth', auth);
app.use('/api/users', authenticateToken, authorize, users);
app.use('/api/posts', authenticateToken, authorize, posts);
app.use('/api/feed', authenticateToken, authorize, feed);
app.use('/api/comments', authenticateToken, authorize, comments);
app.use('/api/notifications', authenticateToken, authorize, notifications);

// error handlers
app.use(notFound);
app.use(errorHandler);
