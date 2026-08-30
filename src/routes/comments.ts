import express, { type Router } from "express";
import { deleteComment, getComment, postComment } from "../controllers/comments.js";
import { validate } from "../middleware/validate.js";
import { createCommentsSchema, deleteCommentsSchema } from "../schemas/comments.schema.js";
import { postIdSchema } from "../schemas/posts.schema.js";

const comments: Router = express.Router();

comments.post("/:id", validate(createCommentsSchema), postComment);
comments.get("/:id", validate(postIdSchema), getComment);
comments.delete("/:postId/:commentId", validate(deleteCommentsSchema), deleteComment);

export default comments;