export interface Payload {
    id: string,
    username: string,
    email: string,
    bio?: string | null
};

export interface User extends Payload {
    password_hash: string,
    bio: string | null,
    created_at: Date
};

export interface LoginResult {
    user: User,
    accessToken: string,
    refreshToken: string
};

export interface CreatePostInput {
    content: string;
    mediaUrls?: string[];
    tags?: string[];
};