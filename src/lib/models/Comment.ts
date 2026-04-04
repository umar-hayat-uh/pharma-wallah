import mongoose, { Schema, models } from "mongoose";

const CommentSchema = new Schema(
  {
    postSlug: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userAvatar: { type: String, default: "" },
    content: { type: String, required: true },
    likes: { type: Number, default: 0 },
    parentCommentId: { type: String, default: null },
  },
  { timestamps: true }
);

export const Comment = models.Comment || mongoose.model("Comment", CommentSchema);