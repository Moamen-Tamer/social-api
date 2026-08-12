import express, { type Router } from "express";
import { deleteUser, followUser, getUserById, listFollowers, unfollowUser, updateBio } from "../controllers/users.js";

const users: Router = express.Router();

users.get("/:id", getUserById);
users.put("/:id", updateBio);
users.delete("/:id", deleteUser);
users.post("/:id/follow", followUser);
users.delete("/:id/follow", unfollowUser);
users.get("/:id/followers", listFollowers);

export default users;
