import express, { type Router } from "express";
import { getPosts } from "../controllers/feed.js";

const feed: Router = express.Router();

feed.get("/", getPosts);

export default feed;