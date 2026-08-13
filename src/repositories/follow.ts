import { db } from "../connections/knex.js";

export const getFollowersIds = async (userId: string) => {
    return db("follows")
        .where("following_id", userId)
        .pluck("follower_id");
};

export const getFollowings = async (userId: string) => {
    return db("follows as f")
        .join(
            "users as u",
            "f.following_id",
            "u.id"
        )
        .select(
            "u.id",
            "u.username"
        )
        .where("f.follower_id", userId)
        .orderBy("u.username", "asc")
};