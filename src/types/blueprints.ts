export interface Payload {
    id: string,
    username: string,
    email: string,
    bio?: string | null
};

export interface User extends Payload {
    bio: string | null,
    created_at: string
};

export interface LoginResult {
    user: User,
    accessToken: string,
    refreshToken: string,
    expiresIn: number
};

export interface refreshResult {
    accessToken: string,
    refreshToken: string,
    expiresIn: number
};

export interface CreatePostInput {
    content: string;
    mediaUrls?: string[];
    tags?: string[];
};

export interface FollowerRow {
    follower: { id: string; username: string; bio: string | null } | null;
};

export interface FollowingRow {
    following: { id: string; username: string } | null;
};