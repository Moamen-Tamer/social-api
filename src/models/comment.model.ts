import mongoose, { Model, Document, Schema } from "mongoose";

export interface IComment extends Document {
    postId: string;
    authorId: string;
    content: string;
    createdAt: Date;
};

const CommentSchema = new Schema<IComment> (
    {
        postId: {
            type: String,
            ref: 'Post',
            required: true
        },
        authorId: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500
        }
    },
    {
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: false
        }
    }
);

CommentSchema.index({ postId: 1, createdAt: -1 });

const Comment: Model<IComment> = mongoose.model("Comment", CommentSchema);

export default Comment;