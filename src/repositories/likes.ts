import { HttpError } from "../errors/HttpError.js";
import { supabase } from "../connections/supabase.js";

export const removeAllLikes = async (
    postId: string
): Promise<void> => {
    const { error } = await supabase
        .from("likes")
        .delete()
        .eq("post_id", postId)

    if (error) throw new HttpError(500, "Failed to remove likes");
};

export const getLikes = async (
    postId: string
): Promise<number> => {
    const { count, error } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId)

    if (error) throw new HttpError(500, "Failed to fetch likes count");

    return count ?? 0;
};

export const addLike = async (
    userId: string,
    postId: string
): Promise<number> => {
    const { error } = await supabase
        .from("likes")
        .insert({
            user_id: userId,
            post_id: postId
        });

    if (error) throw new HttpError(500, "Failed to add like");

    return getLikes(postId);
};

export const removeLike = async (
    userId: string,
    postId: string
): Promise<number> => {
    const { data, error } = await supabase
        .from("likes")
        .delete()
        .eq("user_id", userId)
        .eq("post_id", postId)
        .select()

    if (error) throw new HttpError(500, "Failed to remove like");

    if ((data ?? []).length === 0) throw new HttpError(404, "Post was not liked");

    return getLikes(postId);
};