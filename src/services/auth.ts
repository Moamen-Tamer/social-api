import { HttpError } from "../errors/HttpError.js";
import { deleteAuthUser, existsByEmail, existsByUsername, refreshSupabaseSession, revokeSession, signInWithPassword, signUp } from "../repositories/auth.js";
import type { LoginResult, refreshResult } from "../types/blueprints.js";
import { fetchUserById } from "../repositories/users.js";

export const register = async (username: string, email: string, password: string): Promise<void> => {
    const emailExists: boolean = await existsByEmail(email);

    if (emailExists) throw new HttpError(409, "Email is already registered.");

    const usernameExists: boolean = await existsByUsername(username);

    if (usernameExists) throw new HttpError(409, "Username is already taken.");

    const { user, error } = await signUp(username, email, password);

    if (error) throw new HttpError(409, error.message);

    if (user?.identities && user.identities.length === 0) throw new HttpError(409, "Email is already registered.");
};

export const login = async (email: string, password: string): Promise<LoginResult> => {
    const { user, session, error } = await signInWithPassword(email, password);

    if (error || !user || !session) throw new HttpError(401, "Invalid email or password.");

    const profile = await fetchUserById(user.id);

    if (!profile) throw new HttpError(401, "Invalid email or password.");

    return {
        user: {
            id: user.id,
            username: profile.username,
            email: user.email ?? email,
            bio: profile.bio,
            created_at: profile.created_at
        },
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresIn: session.expires_in
    };
};

export const logout = async (accessToken: string): Promise<void> => {
    if (!accessToken) return;

    await revokeSession(accessToken);
};

export const refreshSession = async (refreshToken: string): Promise<refreshResult> => {
    if (!refreshToken) throw new HttpError(401, "Refresh token required.");

    const { session, error } = await refreshSupabaseSession(refreshToken);

    if (error || !session) throw new HttpError(401, "Invalid or expired refresh token.");

    return {
        accessToken: session?.access_token,
        refreshToken: session?.refresh_token,
        expiresIn: session?.expires_in
    };
};

export const deleteAccount = async (userId: string): Promise<void> => {
    await deleteAuthUser(userId);
};