import express, { type Router } from "express";
import { deleteUser, followUser, getUserById, listFollowers, unfollowUser, updateBio } from "../controllers/users.js";
import { updateBioSchema, userIdSchema } from "../schemas/user.schema.js";
import { validate } from "../middleware/validate.js";

const users: Router = express.Router();

users.get("/:id", validate(userIdSchema), getUserById);
users.put("/:id", validate(updateBioSchema), updateBio);
users.delete("/:id", validate(userIdSchema), deleteUser);
users.post("/:id/follow", validate(userIdSchema), followUser);
users.delete("/:id/follow", validate(userIdSchema), unfollowUser);
users.get("/:id/followers", validate(userIdSchema), listFollowers);

export default users;
