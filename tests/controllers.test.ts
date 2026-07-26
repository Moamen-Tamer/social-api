import type { NextFunction, Request, Response } from "express";

jest.mock("../src/services/posts.js", () => ({
    createPostById: jest.fn(), editPostById: jest.fn(), deletePostById: jest.fn(), getPostById: jest.fn(), likePostById: jest.fn(), unlikePostById: jest.fn()
}));
jest.mock("../src/services/comments.js", () => ({ createComment: jest.fn(), fetchComments: jest.fn(), removeComment: jest.fn() }));
jest.mock("../src/services/users.js", () => ({ updateUserBioById: jest.fn(), getUserDataById: jest.fn(), deleteUserById: jest.fn(), followUserById: jest.fn(), unfollowUserById: jest.fn(), getFollowersById: jest.fn() }));

import { createPost, editPost } from "../src/controllers/posts.js";
import { postComment } from "../src/controllers/comments.js";
import { updateBio } from "../src/controllers/users.js";
import { createPostById, editPostById } from "../src/services/posts.js";
import { createComment } from "../src/services/comments.js";
import { updateUserBioById } from "../src/services/users.js";

const response = () => {
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() } as unknown as Response;
    return res;
};
const next = jest.fn() as NextFunction;
const user = { id: "u1", username: "ahmed_mohamed", email: "ahmedmohamed@gmail.com" };

describe("controllers", () => {
    it("trims post content before creating it", async () => {
        (createPostById as jest.Mock).mockResolvedValue({ id: "p1" });
        const res = response();
        await createPost({ user, body: { content: "  Hello  " } } as Request, res, next);
        expect(createPostById).toHaveBeenCalledWith("u1", { content: "Hello" });
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it("rejects blank post content and passes the error to Express", async () => {
        await editPost({ user, params: { id: "p1" }, body: { content: "   " } } as unknown as Request<{ id: string }>, response(), next);
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
        expect(editPostById).not.toHaveBeenCalled();
    });

    it("trims comment content and validates bios", async () => {
        (createComment as jest.Mock).mockResolvedValue(undefined);
        await postComment({ user, params: { id: "p1" }, body: { content: " Nice work " } } as unknown as Request<{ id: string }>, response(), next);
        expect(createComment).toHaveBeenCalledWith("u1", "p1", "Nice work");

        await updateBio({ user, params: { id: "u1" }, body: { update: "x".repeat(501) } } as unknown as Request<{ id: string }>, response(), next);
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
        expect(updateUserBioById).not.toHaveBeenCalled();
    });
});
