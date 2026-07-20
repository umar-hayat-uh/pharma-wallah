// src/lib/models/Comment.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IComment extends Document {
  unitId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>({
  unitId: { type: String, required: true, index: true },
  authorId: { type: String, required: true },
  authorName: { type: String, required: true },
  authorAvatar: { type: String, default: undefined },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Prevent model re-compilation in development
const Comment: Model<IComment> =
  mongoose.models.Comment ||
  mongoose.model<IComment>("Comment", CommentSchema);

export default Comment;