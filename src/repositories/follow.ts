import { supabase } from "../connections/supabase.js";
import { HttpError } from "../errors/HttpError.js";
import type { FollowingRow } from "../types/blueprints.js";

export const getFollowersIds = async (
    userId: string
): Promise<string[]> => {
    const { data, error } = await supabase
        .from("follows")
        .select("follower_id")
        .eq("following_id", userId);

    if (error) throw new HttpError(500, error.message);

    return (data ?? []).map((row: any) => row.follower_id as string);
};

export const getFollowings = async (userId: string) => {
    const { data, error } = await supabase
        .from("follows")
        .select("following:users!following_id(id, username)")
        .eq("follower_id", userId)
        .order("username", { ascending: true, referencedTable: "users" });

    if (error) throw new HttpError(500, "Failed to fetch followings");

    return ((data ?? []) as unknown as FollowingRow[])
        .map((row: any) => row.following)
        .filter((following): following is { id: string; username: string } => following !== null);
};