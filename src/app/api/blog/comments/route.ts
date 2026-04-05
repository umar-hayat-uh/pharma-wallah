import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import { Comment } from "@/lib/models/Comment";

// GET /api/blog/comments?postSlug=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postSlug = searchParams.get("postSlug");
  if (!postSlug) return NextResponse.json({ error: "Missing postSlug" }, { status: 400 });

  await connectDB();
  const comments = await Comment.find({ postSlug }).sort({ createdAt: -1 }).lean();
  return NextResponse.json(comments);
}

// POST /api/blog/comments  — create comment or reply
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await currentUser();
  const { postSlug, content, parentCommentId = null } = await req.json();

  if (!postSlug || !content?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  await connectDB();
  const comment = await Comment.create({
    postSlug,
    userId,
    userName: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || user?.emailAddresses[0]?.emailAddress || "Anonymous",
    userAvatar: user?.imageUrl ?? "",
    content: content.trim(),
    parentCommentId,
  });

  return NextResponse.json(comment, { status: 201 });
}

// PATCH /api/blog/comments  — toggle like
export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { commentId } = await req.json();
  if (!commentId) return NextResponse.json({ error: "Missing commentId" }, { status: 400 });

  await connectDB();
  const comment = await Comment.findById(commentId);
  if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });

  const alreadyLiked = comment.likedBy.includes(userId);
  if (alreadyLiked) {
    comment.likedBy = comment.likedBy.filter((id: string) => id !== userId);
    comment.likes = Math.max(0, comment.likes - 1);
  } else {
    comment.likedBy.push(userId);
    comment.likes += 1;
  }

  await comment.save();
  return NextResponse.json({ likes: comment.likes, likedBy: comment.likedBy });
}