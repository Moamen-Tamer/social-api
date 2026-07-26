export const makeUserKey = (userId: string): string => {
    return `user:${userId}`;
};

export const makePostKey = (postId: string): string => {
    return `post:${postId}`;
};

export const makeFeedKey = (userId: string): string => {
    return `feed:${userId}`;
};

export const makeCommentsKey = (postId: string): string => {
    return `comment:${postId}`;
};

export const makeNotificationsKey = (userId: string): string => {
    return `notifications:${userId}`;
};
