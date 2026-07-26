import express, { type Router } from "express";
import { createPost, deletePost, editPost, getPost, likePost, unlikePost } from "../controllers/posts.js";

const posts: Router = express.Router();

posts.post("/", createPost);
posts.get("/:id", getPost);
posts.put("/:id", editPost);
posts.delete("/:id", deletePost);
posts.post("/:id/like", likePost);
posts.delete("/:id/like", unlikePost);

export default posts;