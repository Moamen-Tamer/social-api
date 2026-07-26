import express, { type Router } from "express";
import { deleteComment, getComment, postComment } from "../controllers/comments.js";

const comments: Router = express.Router();

comments.post("/:id", postComment);
comments.get("/:id", getComment);
comments.delete("/:postId/:commentId", deleteComment);

export default comments;