import mongoose, { Schema, models } from "mongoose";

const CommentSchema = new Schema(
  {
    postSlug: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userAvatar: { type: String, default: "" },
    content: { type: String, required: true },
    likes: { type: Number, default: 0 },
    likedBy: { type: [String], default: [] }, // array of userIds who liked
    parentCommentId: { type: String, default: null }, // null = top-level comment
  },
  { timestamps: true }
);

export const Comment = models.Comment || mongoose.model("Comment", CommentSchema);