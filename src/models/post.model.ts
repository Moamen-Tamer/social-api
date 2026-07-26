import mongoose, { Model, Document, Schema } from "mongoose";

export interface IPost extends Document {
    authorId: string;
    content: string;
    mediaUrls?: string[];
    tags?: string[];
    createdAt: Date;
};

const PostSchema = new Schema<IPost> (
    {
        authorId: {
            type: String,
            required: true,
            index: true
        },
        content: {
            type: String,
            required: true,
            trim: true,
            maxLength: 1000
        },
        mediaUrls: [{ type: String }],
        tags: [{
            type: String,
            lowercase: true
        }]
    },
    { 
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: false
        } 
    }
);

PostSchema.index({ authorId: 1, createdAt: -1 });

const Post: Model<IPost> = mongoose.model("Post", PostSchema);

export default Post;