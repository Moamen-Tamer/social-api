jest.mock("mongoose", () => ({ __esModule: true, default: { startSession: jest.fn() } }));
jest.mock("../src/repositories/users.js", () => ({
    addFollowing: jest.fn(), deleteFollowing: jest.fn(), deleteUserAccount: jest.fn(), deleteUserRelated: jest.fn(), fetchUserById: jest.fn(), fetchUserRedis: jest.fn(), getFollowers: jest.fn(), updateUserBio: jest.fn()
}));
jest.mock("../src/repositories/cache.js", () => ({ cacheUser: jest.fn(), invalidateFeedCache: jest.fn(), invalidateUserCache: jest.fn(), cachePost: jest.fn(), invalidatePostCache: jest.fn() }));
jest.mock("../src/repositories/notifications.js", () => ({ publishNotification: jest.fn() }));
jest.mock("../src/repositories/auth.js", () => ({ deleteAuthUser: jest.fn() }));
jest.mock("../src/repositories/follow.js", () => ({ getFollowersIds: jest.fn() }));
jest.mock("../src/repositories/posts.js", () => ({ createPostMongo: jest.fn(), deletePostMongo: jest.fn(), editPostMongo: jest.fn(), fetchPostRedis: jest.fn(), getPostAuthor: jest.fn(), getPostMongo: jest.fn() }));
jest.mock("../src/repositories/comments.js", () => ({ deleteCommentsOnPost: jest.fn(), getCommentsOnPost: jest.fn() }));
jest.mock("../src/repositories/likes.js", () => ({ addLike: jest.fn(), getLikes: jest.fn(), removeAllLikes: jest.fn(), removeLike: jest.fn() }));

import { followUserById } from "../src/services/users.js";
import { addFollowing, fetchUserRedis } from "../src/repositories/users.js";
import { publishNotification } from "../src/repositories/notifications.js";
import { createPostById } from "../src/services/posts.js";
import { createPostMongo } from "../src/repositories/posts.js";
import { getFollowersIds } from "../src/repositories/follow.js";
import { invalidateFeedCache } from "../src/repositories/cache.js";

describe("user and post services", () => {
    it("rejects a self-follow before touching storage", async () => {
        await expect(followUserById("u1", "u1")).rejects.toMatchObject({ status: 400 });
        expect(addFollowing).not.toHaveBeenCalled();
    });

    it("rejects an already-existing follow without publishing a notification", async () => {
        (fetchUserRedis as jest.Mock).mockImplementation(async (id: string) => ({ id, username: id === "u1" ? "ahmed_mohamed" : "mariam_hassan" }));
        (addFollowing as jest.Mock).mockResolvedValue([]);
        await expect(followUserById("u1", "u2")).rejects.toMatchObject({ status: 409 });
        expect(publishNotification).not.toHaveBeenCalled();
    });

    it("creates posts and invalidates the author and follower feeds", async () => {
        (createPostMongo as jest.Mock).mockResolvedValue({ id: "p1" });
        (getFollowersIds as jest.Mock).mockResolvedValue(["u2", "u3"]);
        await createPostById("u1", { content: "A post" });
        expect(invalidateFeedCache).toHaveBeenCalledWith("u1");
        expect(invalidateFeedCache).toHaveBeenCalledWith("u2");
        expect(invalidateFeedCache).toHaveBeenCalledWith("u3");
    });
});
