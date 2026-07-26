import express, { type Router } from "express";
import { getNotifications, markNotifications } from "../controllers/notifications.js";

const notifications: Router = express.Router();

notifications.get("/", getNotifications);
notifications.patch("/read", markNotifications);

export default notifications;