import express, { type Router } from "express";
import { createPost, deletePost, editPost, getPost, likePost, unlikePost } from "../controllers/posts.js";
import { createPostSchema, editPostSchema, postIdSchema } from "../schemas/posts.schema.js";
import { validate } from "../middleware/validate.js";

const posts: Router = express.Router();

posts.post("/", validate(createPostSchema), createPost);
posts.get("/:id", validate(postIdSchema), getPost);
posts.put("/:id", validate(editPostSchema), editPost);
posts.delete("/:id", validate(postIdSchema), deletePost);
posts.post("/:id/like", validate(postIdSchema), likePost);
posts.delete("/:id/like", validate(postIdSchema), unlikePost);

export default posts;