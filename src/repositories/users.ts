import { redis } from "../connections/redis.js";
import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";
import type mongoose from "mongoose";
import { makeUserKey } from "../utils/redis.js";
import { supabase } from "../connections/supabase.js";
import type { FollowerRow, User } from "../types/blueprints.js";
import { HttpError } from "../errors/HttpError.js";

export const fetchUserRedis = async (
    userId: string
) => {
    const key = makeUserKey(userId);

    const user = await redis.get(key);

    if (!user) return null;

    return JSON.parse(user);
};

export const fetchUserById = async (
    userId: string
) => {
    const { data, error } = await supabase
        .from("users")
        .select("id, username, bio, created_at")
        .eq("id", userId)
        .maybeSingle();

    if (error) throw new HttpError(500, "Failed to fetch user");

    return data ?? undefined;
};

export const updateUserBio = async (
    userId: string,
    update: string
): Promise<User[]> => {
    const { data, error } = await supabase
        .from("users")
        .update(
            {
                bio: update
            }
        )
        .eq("id", userId)
        .select("id, username, email, bio, created_at");

    if (error) throw new HttpError(500, "Failed to update user bio");

    return (data ?? []) as User[];
};

export const deleteUserRelated = async (
    userId: string,
    session?: mongoose.mongo.ClientSession
): Promise<void> => {
    await Promise.all([
        Post.deleteMany(
            { authorId: userId },
            session ? { session } : {}
        ),
        Comment.deleteMany(
            { authorId: userId },
            session ? { session } : {}
        )
    ]);
};

export const addFollowing = async (
    followerId: string,
    followingId: string
) => {
    const { data, error } = await supabase
        .from("follows")
        .upsert(
            {
                follower_id: followerId,
                following_id: followingId
            },
            {
                onConflict: "follower_id, following_id", ignoreDuplicates: true
            }
        )
        .select("follower_id, following_id, created_at");

    if (error) throw new HttpError(500, "Failed to follow user");

    return data ?? [];
};

export const deleteFollowing = async (
    followerId: string,
    followingId: string
) => {
    const { data, error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", followerId)
        .eq("following_id", followingId)
        .select("*");

    if (error) throw new HttpError(500, "Failed to unfollow user");

    return data ?? [];
};

export const getFollowers = async (
    userId: string
) => {
    const { data, error } = await supabase
        .from("follows")
        .select("follower:users!follower_id(id, username, bio)")
        .eq("following_id", userId)
        .order("created_at", { ascending: false });

    if (error) throw new HttpError(500, "Failed to fetch followers");

    return ((data ?? []) as unknown as FollowerRow[])
        .map((row: any) => row.follower)
        .filter((follower): follower is { id: string; username: string; bio: string | null } => follower !== null);
};
